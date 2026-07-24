const Razorpay = require('razorpay');
const crypto = require('crypto');
const StorageService = require('../services/storageService');
const { validateBookingDetails } = require('../utils/bookingValidator');

const PaymentController = {
  // Create Razorpay Order
  async createOrder(req, res, next) {
    try {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return res.status(500).json({
          success: false,
          message: 'Razorpay keys are not configured in backend environment'
        });
      }

      const {
        amount,
        currency = 'INR',
        receipt,
        counsellorId,
        date,
        time,
        mode,
        service,
        couponCode,
        clientLatitude,
        clientLongitude,
        notes: customNotes
      } = req.body;

      let amountInPaise = 0;
      let orderNotes = { ...(customNotes || {}) };
      let netTotal = 0;

      // Scenario 1: Direct amount provided (e.g. standard checkout payload)
      if (amount !== undefined && amount !== null && amount !== '') {
        amountInPaise = Number(amount);
        if (isNaN(amountInPaise) || amountInPaise < 100) {
          return res.status(400).json({
            success: false,
            message: 'Invalid amount. Minimum amount is 100 paise'
          });
        }
        netTotal = amountInPaise / 100;
        if (req.user && req.user.id) {
          orderNotes.userId = req.user.id;
        }
      }
      // Scenario 2: Booking details provided
      else if (counsellorId && date && time && mode) {
        // Validate booking details (availability, double booking, past date)
        const validation = await validateBookingDetails(
          counsellorId,
          date,
          time,
          mode,
          service || 'counselling',
          null,
          clientLatitude,
          clientLongitude
        );
        if (!validation.valid) {
          return res.status(400).json({ success: false, message: validation.message });
        }

        const counsellor = validation.counsellor;
        const settings = (await StorageService.findOne('settings')) || {};

        const baseFee = Number(counsellor.price) || 1200;
        const gstEnabled = settings.gstEnabled === true;
        const gstPercent = gstEnabled ? Number(settings.gstPercent) || 0 : 0;
        const gstAmount = gstPercent > 0 ? Math.round(baseFee * (gstPercent / 100)) : 0;
        const totalBeforeDiscount = baseFee + gstAmount;

        let appliedDiscount = 0;
        if (couponCode && settings.promoCodes && Array.isArray(settings.promoCodes)) {
          const cleanCoupon = couponCode.toUpperCase().trim();
          const foundPromo = settings.promoCodes.find(
            (p) => p.code.toUpperCase() === cleanCoupon && p.isActive !== false
          );
          if (foundPromo) {
            if (foundPromo.type === 'PERCENTAGE') {
              appliedDiscount = Math.round(totalBeforeDiscount * (foundPromo.value / 100));
            } else {
              appliedDiscount = foundPromo.value;
            }
          }
        }
        netTotal = Math.max(1, totalBeforeDiscount - appliedDiscount);
        amountInPaise = netTotal * 100;

        if (amountInPaise < 100) {
          return res.status(400).json({
            success: false,
            message: 'Calculated amount is below minimum limit of 100 paise'
          });
        }

        orderNotes = {
          ...orderNotes,
          counsellorId,
          userId: req.user ? req.user.id : '',
          date,
          time,
          mode,
          service: service || 'counselling',
          couponCode: couponCode || '',
          appliedDiscount: String(appliedDiscount)
        };
      } else {
        return res.status(400).json({
          success: false,
          message: 'Either amount (in paise, >= 100) or complete booking details (counsellorId, date, time, mode) are required'
        });
      }

      const keyId = (process.env.RAZORPAY_KEY_ID || '').trim().replace(/^["']|["']$/g, '');
      const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim().replace(/^["']|["']$/g, '');

      if (!keyId || !keySecret) {
        return res.status(500).json({
          success: false,
          message: 'Razorpay API keys (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are missing in environment variables'
        });
      }

      // Initialize Razorpay SDK
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });

      // Create Order options
      const options = {
        amount: amountInPaise,
        currency: (currency || 'INR').toUpperCase(),
        receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        notes: orderNotes
      };

      let order;
      try {
        order = await razorpay.orders.create(options);
      } catch (err) {
        console.error('[Razorpay API Error]:', err);
        const detailedError =
          err.error?.description ||
          err.description ||
          err.message ||
          (typeof err.error === 'string' ? err.error : null) ||
          'Error communicating with Razorpay API';

        const statusCode = err.statusCode || (err.error?.code === 'BAD_REQUEST_ERROR' ? 400 : 500);

        return res.status(statusCode).json({
          success: false,
          message: `Razorpay API Error: ${detailedError}`
        });
      }

      res.status(200).json({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
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
      res.status(500).json({
        success: false,
        message: error.message || 'Server error creating Razorpay order'
      });
    }
  },

  // Verify signature and book appointment / finalize payment
  async verifyPaymentAndBook(req, res, next) {
    try {
      const razorpay_payment_id = req.body.razorpay_payment_id || req.body.payment_id;
      const razorpay_order_id = req.body.razorpay_order_id || req.body.order_id;
      const razorpay_signature = req.body.razorpay_signature || req.body.signature;
      const bookingDetails = req.body.bookingDetails;

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing required verification fields: razorpay_payment_id, razorpay_order_id, and razorpay_signature are required'
        });
      }

      const keyId = (process.env.RAZORPAY_KEY_ID || '').trim().replace(/^["']|["']$/g, '');
      const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim().replace(/^["']|["']$/g, '');

      if (!keySecret) {
        return res.status(500).json({
          success: false,
          message: 'Razorpay secret key is not configured in backend environment'
        });
      }

      // 1. Verify Razorpay cryptographic signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      const isSignatureValid = expectedSignature === razorpay_signature;

      if (!isSignatureValid) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Signature mismatch'
        });
      }

      // If no booking details provided, return standalone payment verification success
      if (!bookingDetails) {
        return res.status(200).json({
          success: true,
          message: 'Payment signature verified successfully',
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
          razorpay_order_id,
          razorpay_payment_id
        });
      }

      const { counsellorId, date, time, mode, service, clientLocationName, clientLatitude, clientLongitude } = bookingDetails;
      const userId = req.user ? req.user.id : '';

      if (!counsellorId || !date || !time || !mode) {
        return res.status(400).json({
          success: false,
          message: 'Counsellor ID, date, time, and mode are required in booking details'
        });
      }

      // 2. Fetch Razorpay order details and compare with booking details if available
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });
      let order;
      try {
        order = await razorpay.orders.fetch(razorpay_order_id);
      } catch (err) {
        console.warn('[Razorpay Order Fetch Warning]: Could not fetch order details from Razorpay API:', err.error?.description || err.message || err);
      }

      if (order && order.notes) {
        const notes = order.notes || {};
        if (
          (notes.counsellorId && notes.counsellorId !== counsellorId) ||
          (notes.userId && notes.userId !== userId)
        ) {
          return res.status(400).json({
            success: false,
            message: 'Payment verification failed: Booking details do not match the paid order.'
          });
        }
      }

      // 3. Final validation check (double booking, past date, counsellor availability)
      const validation = await validateBookingDetails(counsellorId, date, time, mode, service || 'counselling', null, clientLatitude, clientLongitude);
      if (!validation.valid) {
        return res.status(400).json({ success: false, message: validation.message });
      }

      const user = await StorageService.findById('users', userId);
      if (!user) return res.status(404).json({ success: false, message: 'Student profile not found' });
      const counsellor = validation.counsellor;

      // 4. Compute price for records (taking into account any discount from order notes)
      const appliedDiscount = Number(notes.appliedDiscount) || 0;
      const couponCode = notes.couponCode || '';

      const settings = (await StorageService.findOne('settings')) || {};
      const baseFee = Number(counsellor.price) || 1200;
      const gstEnabled = settings.gstEnabled === true;
      const gstPercent = gstEnabled ? Number(settings.gstPercent) || 0 : 0;
      const gstAmount = gstPercent > 0 ? Math.round(baseFee * (gstPercent / 100)) : 0;
      const netTotal = Math.max(1, baseFee + gstAmount - appliedDiscount);

      let finalMeetLink = mode === 'ONLINE' ? counsellor.defaultMeetLink || '' : '';

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

          const frontendUrl = process.env.FRONTEND_URL || 'https://behold-aspire.vercel.app';
          const event = {
            summary: `Counselling Session: ${user.name} & ${counsellor.name}`,
            description: `Service: ${service || 'Counselling'}\nMode: ONLINE\n\nAccess your session details, reports, and portal on BEHOLD:\n- Student Portal: ${frontendUrl}/profile\n- Advisor Portal: ${frontendUrl}/counsellor`,
            start: { dateTime: startTime.toISOString() },
            end: { dateTime: endTime.toISOString() },
            attendees: [{ email: user.email }, { email: counsellor.email }],
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

      // 4. Calculate commission
      const commissionPercent = counsellor.commissionPercent !== undefined ? Number(counsellor.commissionPercent) : (settings.counsellorSplitPercent !== undefined ? Number(settings.counsellorSplitPercent) : 50);
      const counsellorShareAmount = Number((netTotal * (commissionPercent / 100)).toFixed(2));

      // 5. Create appointment
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
        couponCode,
        clientLocationName: clientLocationName || '',
        clientLatitude: Number(clientLatitude) || 0,
        clientLongitude: Number(clientLongitude) || 0,
        commissionPercent,
        counsellorShareAmount
      });

      // 6. Send notifications to counsellor
      await StorageService.create('notifications', {
        recipientId: counsellorId,
        recipientRole: 'counsellor',
        title: 'New Paid Appointment Request',
        message: `Student ${user.name} has requested an appointment on ${date} at ${time}. Payment of ₹${netTotal} is verified.`,
        type: 'appointment_created',
        isRead: false
      });

      // 7. Send notifications to student
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
