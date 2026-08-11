const Razorpay = require('razorpay');
const crypto = require('crypto');
const StorageService = require('../services/storageService');
const { validateBookingDetails } = require('../utils/bookingValidator');
const EmailService = require('../services/emailService');

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
        clientName,
        clientEmail,
        clientPhone,
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
          clientName: clientName || '',
          clientEmail: clientEmail || '',
          clientPhone: clientPhone || '',
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

      const { counsellorId, date, time, mode, service, clientLocationName, clientLatitude, clientLongitude, clientName, clientEmail, clientPhone } = bookingDetails;
      const userId = req.user ? req.user.id : '';

      if (!counsellorId || !date || !time || !mode) {
        return res.status(400).json({
          success: false,
          message: 'Counsellor ID, date, time, and mode are required in booking details'
        });
      }

      const { cleanDuplicateAppointments } = require('../utils/appointmentDeduplicator');

      // Check if an appointment for this Razorpay order/payment or slot was ALREADY created
      const filterOr = [];
      if (razorpay_order_id) filterOr.push({ razorpayOrderId: razorpay_order_id });
      if (razorpay_payment_id) filterOr.push({ razorpayPaymentId: razorpay_payment_id });
      filterOr.push({ counsellorId, date, time, status: { $ne: 'CANCELLED' } });

      let existingAppt = await StorageService.findOne('appointments', { $or: filterOr });

      if (existingAppt) {
        const updateFields = {};
        if (existingAppt.paymentStatus !== 'PAID') updateFields.paymentStatus = 'PAID';
        if (razorpay_order_id && !existingAppt.razorpayOrderId) updateFields.razorpayOrderId = razorpay_order_id;
        if (razorpay_payment_id && !existingAppt.razorpayPaymentId) updateFields.razorpayPaymentId = razorpay_payment_id;
        if (userId && !existingAppt.userId) updateFields.userId = userId;

        if (Object.keys(updateFields).length > 0) {
          await StorageService.update('appointments', existingAppt.id, updateFields);
          Object.assign(existingAppt, updateFields);
        }
        cleanDuplicateAppointments().catch(() => {});
        return res.status(200).json({
          success: true,
          message: 'Payment verified and appointment confirmed.',
          data: existingAppt
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

      let notes = {};
      if (order && order.notes) {
        notes = order.notes || {};
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
      let conflictWarning = null;
      if (!validation.valid) {
        console.warn(`[Payment Verification] Validation failed but payment received. Proceeding to prevent money loss. Reason: ${validation.message}`);
        conflictWarning = validation.message;
      }

      const user = await StorageService.findById('users', userId);
      if (!user) return res.status(404).json({ success: false, message: 'Student profile not found' });
      
      let counsellor = validation.counsellor;
      if (!counsellor) {
        counsellor = await StorageService.findById('counsellors', counsellorId);
      }
      if (!counsellor) return res.status(404).json({ success: false, message: 'Counsellor not found' });
      // 4. Compute price for records (taking into account any discount from order notes)
      const appliedDiscount = Number(notes.appliedDiscount) || 0;
      const couponCode = notes.couponCode || '';

      const settings = (await StorageService.findOne('settings')) || {};
      const baseFee = Number(counsellor.price) || 1200;
      const gstEnabled = settings.gstEnabled === true;
      const gstPercent = gstEnabled ? Number(settings.gstPercent) || 0 : 0;
      const gstAmount = gstPercent > 0 ? Math.round(baseFee * (gstPercent / 100)) : 0;
      const netTotal = Math.max(1, baseFee + gstAmount - appliedDiscount);

      let finalMeetLink = '';
      if (mode === 'ONLINE') {
        const { generateSessionMeetingLink } = require('../utils/calendarHelper');
        finalMeetLink = await generateSessionMeetingLink({
          counsellor,
          user,
          date,
          time,
          service,
          appointmentId: `app_${Date.now()}`
        });
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
        clientName: clientName || user.name || '',
        clientEmail: clientEmail || user.email || '',
        clientPhone: clientPhone || user.phone || '',
        clientLocationName: clientLocationName || '',
        clientLatitude: Number(clientLatitude) || 0,
        clientLongitude: Number(clientLongitude) || 0,
        commissionPercent,
        counsellorShareAmount
      });

      cleanDuplicateAppointments().catch(() => {});

      res.status(200).json({
        success: true,
        message: 'Payment verified and appointment confirmed.',
        warning: conflictWarning || undefined,
        data: newAppointment
      });

      // --- Background Processing for Notifications ---
      (async () => {
        try {
          // Send notification to counsellor
          await StorageService.create('notifications', {
            recipientId: counsellorId,
            recipientRole: 'counsellor',
            title: 'New Paid Appointment Request',
            message: `Student ${clientName || user.name} requested an appointment on ${date} at ${time}. Payment ₹${netTotal} confirmed.`,
            type: 'appointment_created',
            isRead: false
          });

          // Send notification to student
          await StorageService.create('notifications', {
            recipientId: userId,
            recipientRole: 'user',
            title: 'Payment Confirmed & Booking Submitted',
            message: `Your booking with ${counsellor.name} on ${date} at ${time} is confirmed. Payment ₹${netTotal} received.`,
            type: 'appointment_created',
            isRead: false
          });

          // --- Email Alerts for Paid Bookings ---
          if (user && counsellor) {
            EmailService.sendAppointmentBooked({ user, counsellor, appointment: newAppointment }).catch(err => console.error('[Email Booked Error]:', err));
            EmailService.sendPaymentReceipt({ user, appointment: newAppointment, counsellor, amount: netTotal, transactionId: razorpay_payment_id }).catch(err => console.error('[Email Payment Receipt Error]:', err));
          }
        } catch (bgError) {
          console.error('[Background Task Error in paymentController]:', bgError);
        }
      })();

    } catch (error) {
      next(error);
    }
  },

  // Handle Razorpay Webhook
  async handleWebhook(req, res, next) {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error('[Razorpay Webhook Error]: RAZORPAY_WEBHOOK_SECRET is not configured.');
        return res.status(500).json({ success: false, message: 'Server webhook configuration error' });
      }

      const signature = req.headers['x-razorpay-signature'];
      if (!signature) {
        return res.status(400).json({ success: false, message: 'Missing razorpay signature' });
      }
      const shasum = crypto.createHmac('sha256', webhookSecret);
      const rawBody = req.rawBody || JSON.stringify(req.body);
      shasum.update(rawBody);
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        console.warn('[Razorpay Webhook Signature Mismatch]');
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }

      const eventPayload = req.body || {};
      const event = eventPayload.event;
      console.log(`[Razorpay Webhook Received]: Event "${event}"`);

      const payloadEntity = eventPayload.payload?.payment?.entity || eventPayload.payload?.order?.entity || {};
      const orderId = payloadEntity.order_id || payloadEntity.id;
      const paymentId = payloadEntity.id;

      if (event === 'payment.captured' || event === 'order.paid') {
        const { cleanDuplicateAppointments } = require('../utils/appointmentDeduplicator');
        let notes = {};
        let netTotal = 0;

        if (orderId) {
          try {
            const keyId = (process.env.RAZORPAY_KEY_ID || '').trim().replace(/^["']|["']$/g, '');
            const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim().replace(/^["']|["']$/g, '');
            if (keyId && keySecret) {
              const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
              const orderObj = await razorpay.orders.fetch(orderId);
              notes = orderObj.notes || {};
              netTotal = (orderObj.amount || 0) / 100;
            }
          } catch (e) {
            console.error('[Webhook Order Fetch Error]:', e.message);
          }
        }

        const filterOr = [];
        if (orderId) filterOr.push({ razorpayOrderId: orderId });
        if (paymentId) filterOr.push({ razorpayPaymentId: paymentId });
        if (notes.counsellorId && notes.date && notes.time) {
          filterOr.push({ counsellorId: notes.counsellorId, date: notes.date, time: notes.time, status: { $ne: 'CANCELLED' } });
        }

        const existingAppointment = filterOr.length > 0 ? await StorageService.findOne('appointments', { $or: filterOr }) : null;

        if (existingAppointment) {
          if (existingAppointment.paymentStatus !== 'PAID') {
            await StorageService.update('appointments', existingAppointment.id, {
              paymentStatus: 'PAID',
              razorpayPaymentId: paymentId || existingAppointment.razorpayPaymentId,
              razorpayOrderId: orderId || existingAppointment.razorpayOrderId
            });
            console.log(`[Razorpay Webhook]: Updated appointment ${existingAppointment.id} paymentStatus to PAID`);
          }
          cleanDuplicateAppointments().catch(() => {});
        } else if (notes.counsellorId && notes.date && notes.time && notes.mode) {
          const validation = await validateBookingDetails(
            notes.counsellorId,
            notes.date,
            notes.time,
            notes.mode,
            notes.service || 'counselling'
          );

          if (validation.valid) {
            const counsellor = validation.counsellor;
            const settings = (await StorageService.findOne('settings')) || {};
            const commissionPercent = counsellor.commissionPercent !== undefined 
              ? Number(counsellor.commissionPercent) 
              : (settings.counsellorSplitPercent !== undefined ? Number(settings.counsellorSplitPercent) : 50);
            const counsellorShareAmount = Number((netTotal * (commissionPercent / 100)).toFixed(2));

            const { generateSessionMeetingLink } = require('../utils/calendarHelper');
            const autoMeetLink = notes.mode === 'ONLINE' ? await generateSessionMeetingLink({
              counsellor,
              user: notes.userId ? await StorageService.findById('users', notes.userId) : null,
              date: notes.date,
              time: notes.time,
              service: notes.service || 'counselling',
              appointmentId: `app_wh_${Date.now()}`
            }) : '';

            const newBooking = await StorageService.create('appointments', {
              userId: notes.userId || '',
              counsellorId: notes.counsellorId,
              date: notes.date,
              time: notes.time,
              mode: notes.mode,
              meetLink: autoMeetLink,
              status: 'PENDING',
              service: notes.service || 'counselling',
              paymentStatus: 'PAID',
              razorpayOrderId: orderId,
              razorpayPaymentId: paymentId || '',
              amountPaid: netTotal,
              appliedDiscount: Number(notes.appliedDiscount) || 0,
              couponCode: notes.couponCode || '',
              clientName: notes.clientName || '',
              clientEmail: notes.clientEmail || '',
              clientPhone: notes.clientPhone || '',
              clientLocationName: notes.clientLocationName || '',
              clientLatitude: Number(notes.clientLatitude) || 0,
              clientLongitude: Number(notes.clientLongitude) || 0,
              commissionPercent,
              counsellorShareAmount
            });

            console.log(`[Razorpay Webhook]: Auto-created booking ${newBooking.id} via captured payment event.`);
            cleanDuplicateAppointments().catch(() => {});

            if (notes.counsellorId) {
              await StorageService.create('notifications', {
                recipientId: notes.counsellorId,
                recipientRole: 'counsellor',
                title: 'New Paid Appointment Request',
                message: `Appointment booked on ${notes.date} at ${notes.time}. Payment ₹${netTotal} confirmed via Webhook.`,
                type: 'appointment_created',
                isRead: false
              });
            }
          }
        }
      } else if (event === 'refund.processed' || event === 'refund.created') {
        const refundEntity = eventPayload.payload?.refund?.entity || {};
        const refundPaymentId = refundEntity.payment_id || paymentId;

        if (refundPaymentId) {
          const appointment = await StorageService.findOne('appointments', { razorpayPaymentId: refundPaymentId });
          if (appointment) {
            await StorageService.update('appointments', appointment.id, {
              refundStatus: 'REFUNDED',
              paymentStatus: 'REFUNDED',
              refundId: refundEntity.id || appointment.refundId,
              refundedAt: new Date()
            });
            console.log(`[Razorpay Webhook]: Marked appointment ${appointment.id} as REFUNDED.`);
          }
        }
      } else if (event === 'payment.failed') {
        if (paymentId || orderId) {
          const appointment = await StorageService.findOne('appointments', {
            $or: [
              { razorpayPaymentId: paymentId },
              { razorpayOrderId: orderId }
            ]
          });
          if (appointment && appointment.paymentStatus !== 'PAID') {
            await StorageService.update('appointments', appointment.id, { paymentStatus: 'FAILED' });
            console.log(`[Razorpay Webhook]: Marked appointment ${appointment.id} paymentStatus as FAILED.`);
          }
        }
      }

      return res.status(200).json({ success: true, message: 'Webhook event processed successfully', event });
    } catch (error) {
      console.error('[Razorpay Webhook Error]:', error);
      res.status(500).json({ success: false, message: 'Webhook processing error', error: error.message });
    }
  }
};

module.exports = PaymentController;
