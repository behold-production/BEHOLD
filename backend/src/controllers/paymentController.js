const Razorpay = require('razorpay');
const crypto = require('crypto');
const StorageService = require('../services/storageService');
const { validateBookingDetails } = require('../utils/bookingValidator');

const PaymentController = {
  // Create Razorpay Order
  async createOrder(req, res, next) {
    try {
      const { counsellorId, date, time, mode, service } = req.body;
      if (!counsellorId || !date || !time || !mode) {
        return res.status(400).json({ success: false, message: 'Counsellor ID, date, time, and mode are required' });
      }

      // 1. Validate booking details (availability, double booking, past date)
      const validation = await validateBookingDetails(counsellorId, date, time, mode, service || 'counselling');
      if (!validation.valid) {
        return res.status(400).json({ success: false, message: validation.message });
      }

      const counsellor = validation.counsellor;

      // 2. Fetch site settings to see if GST is enabled
      const settings = await StorageService.findOne('settings') || {};
      
      const baseFee = Number(counsellor.price) || 1200;
      const gstEnabled = settings.gstEnabled === true;
      const gstPercent = gstEnabled ? (Number(settings.gstPercent) || 0) : 0;
      const gstAmount = gstPercent > 0 ? Math.round(baseFee * (gstPercent / 100)) : 0;
      
      // Calculate net total in INR before discount
      const totalBeforeDiscount = baseFee + gstAmount;

      // Apply coupon code if provided
      const { couponCode } = req.body;
      let appliedDiscount = 0;
      if (couponCode && settings.promoCodes && Array.isArray(settings.promoCodes)) {
        const cleanCoupon = couponCode.toUpperCase().trim();
        const foundPromo = settings.promoCodes.find(p => p.code.toUpperCase() === cleanCoupon && p.isActive !== false);
        if (foundPromo) {
          if (foundPromo.type === 'PERCENTAGE') {
            appliedDiscount = Math.round(totalBeforeDiscount * (foundPromo.value / 100));
          } else {
            appliedDiscount = foundPromo.value;
          }
        }
      }
      const netTotal = Math.max(1, totalBeforeDiscount - appliedDiscount);

      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return res.status(500).json({ 
          success: false, 
          message: 'Razorpay keys are not configured in backend environment' 
        });
      }

      // 3. Initialize Razorpay
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });

      // 4. Create Order options
      const options = {
        amount: netTotal * 100, // Razorpay amount is in paise (INR * 100)
        currency: 'INR',
        receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        notes: {
          counsellorId,
          userId: req.user.id,
          date,
          time,
          mode,
          service: service || 'counselling',
          couponCode: couponCode || '',
          appliedDiscount: String(appliedDiscount)
        }
      };

      const order = await razorpay.orders.create(options);

      res.status(200).json({
        success: true,
        data: {
          keyId: process.env.RAZORPAY_KEY_ID,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          netTotal
        }
      });
    } catch (error) {
      console.error('[Razorpay Order Creation Error]:', error);
      next(error);
    }
  },

  // Verify signature and book appointment
  async verifyPaymentAndBook(req, res, next) {
    try {
      const { 
        razorpay_payment_id, 
        razorpay_order_id, 
        razorpay_signature, 
        bookingDetails 
      } = req.body;

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !bookingDetails) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required signature verification fields or booking details' 
        });
      }

      const { counsellorId, date, time, mode, service } = bookingDetails;
      const userId = req.user.id;

      if (!counsellorId || !date || !time || !mode) {
        return res.status(400).json({ 
          success: false, 
          message: 'Counsellor ID, date, time, and mode are required in booking details' 
        });
      }

      // 1. Verify Razorpay cryptographic signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      const isSignatureValid = expectedSignature === razorpay_signature;

      if (!isSignatureValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Payment verification failed: Signature mismatch' 
        });
      }

      // 2. Fetch Razorpay order details and compare with booking details to prevent tampering
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
      let order;
      try {
        order = await razorpay.orders.fetch(razorpay_order_id);
      } catch (err) {
        console.error('[Razorpay Order Fetch Error]:', err);
        return res.status(400).json({ success: false, message: 'Invalid payment details: Order not found' });
      }

      if (!order) {
        return res.status(404).json({ success: false, message: 'Razorpay order not found' });
      }

      const notes = order.notes || {};
      if (
        notes.counsellorId !== counsellorId ||
        notes.userId !== userId ||
        notes.date !== date ||
        notes.time !== time ||
        notes.mode !== mode ||
        notes.service !== (service || 'counselling')
      ) {
        return res.status(400).json({ 
          success: false, 
          message: 'Payment verification failed: Booking details do not match the paid order.' 
        });
      }

      // 3. Final validation check (double booking, past date, counsellor availability)
      const validation = await validateBookingDetails(counsellorId, date, time, mode, service || 'counselling');
      if (!validation.valid) {
        return res.status(400).json({ success: false, message: validation.message });
      }

      const user = await StorageService.findById('users', userId);
      if (!user) return res.status(404).json({ success: false, message: 'Student profile not found' });
      const counsellor = validation.counsellor;

      // 4. Compute price for records (taking into account any discount from order notes)
      const appliedDiscount = Number(notes.appliedDiscount) || 0;
      const couponCode = notes.couponCode || '';

      const settings = await StorageService.findOne('settings') || {};
      const baseFee = Number(counsellor.price) || 1200;
      const gstEnabled = settings.gstEnabled === true;
      const gstPercent = gstEnabled ? (Number(settings.gstPercent) || 0) : 0;
      const gstAmount = gstPercent > 0 ? Math.round(baseFee * (gstPercent / 100)) : 0;
      const netTotal = Math.max(1, baseFee + gstAmount - appliedDiscount);

      let finalMeetLink = mode === 'ONLINE' ? (counsellor.defaultMeetLink || '') : '';

      if (mode === 'ONLINE' && counsellor.googleRefreshToken) {
        try {
          const { google } = require('googleapis');
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google/callback'
          );
          oauth2Client.setCredentials({ refresh_token: counsellor.googleRefreshToken });
          
          const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
          
          // Construct Start and End Date
          const [year, month, day] = date.split('-');
          let [timePart, period] = time.split(' ');
          let [hours, minutes] = timePart.split(':');
          hours = parseInt(hours, 10);
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          
          const startTimeStr = `${year}-${month}-${day}T${hours.toString().padStart(2, '0')}:${minutes}:00+05:30`;
          const startTime = new Date(startTimeStr);
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration
          
          const event = {
            summary: `Counselling Session: ${user.name} & ${counsellor.name}`,
            description: `Service: ${service || 'Counselling'}\nMode: ONLINE`,
            start: { dateTime: startTime.toISOString() },
            end: { dateTime: endTime.toISOString() },
            attendees: [
              { email: user.email },
              { email: counsellor.email }
            ],
            conferenceData: {
              createRequest: {
                requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                conferenceSolutionKey: { type: 'hangoutsMeet' }
              }
            }
          };

          const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
            sendUpdates: 'all'
          });

          if (response.data && response.data.hangoutLink) {
            finalMeetLink = response.data.hangoutLink;
          }
        } catch (calError) {
          console.error('[Google Calendar Error]:', calError);
          // Fallback to defaultMeetLink if API fails
        }
      }

      // 4. Create appointment
      const newAppointment = await StorageService.create('appointments', {
        userId,
        counsellorId,
        date,
        time,
        mode,
        meetLink: finalMeetLink,
        status: 'PENDING',
        service: service || 'counselling',
        paymentStatus: 'PAID',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amountPaid: netTotal,
        appliedDiscount,
        couponCode
      });

      // 5. Send notifications to counsellor
      await StorageService.create('notifications', {
        recipientId: counsellorId,
        recipientRole: 'counsellor',
        title: 'New Paid Appointment Request',
        message: `Student ${user.name} has requested an appointment on ${date} at ${time}. Payment of ₹${netTotal} is verified.`,
        type: 'appointment_created',
        isRead: false
      });

      // 6. Send notifications to student
      await StorageService.create('notifications', {
        recipientId: userId,
        recipientRole: 'user',
        title: 'Appointment Booked Successfully',
        message: `Your booking with ${counsellor.name} on ${date} at ${time} has been submitted (Paid ₹${netTotal}).`,
        type: 'appointment_created',
        isRead: false
      });

      res.status(201).json({
        success: true,
        message: 'Payment verified and appointment booked successfully',
        data: newAppointment
      });
    } catch (error) {
      console.error('[Razorpay Signature Verification Error]:', error);
      next(error);
    }
  }
};

module.exports = PaymentController;
