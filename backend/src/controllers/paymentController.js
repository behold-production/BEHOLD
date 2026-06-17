const Razorpay = require('razorpay');
const crypto = require('crypto');
const StorageService = require('../services/storageService');

const PaymentController = {
  // Create Razorpay Order
  async createOrder(req, res, next) {
    try {
      const { counsellorId } = req.body;
      if (!counsellorId) {
        return res.status(400).json({ success: false, message: 'Counsellor ID is required' });
      }

      // 1. Fetch counsellor to get their rate
      const counsellor = await StorageService.findById('counsellors', counsellorId);
      if (!counsellor) {
        return res.status(404).json({ success: false, message: 'Counsellor not found' });
      }

      // 2. Fetch site settings to see if GST is enabled
      const settings = await StorageService.findOne('settings') || {};
      
      const baseFee = Number(counsellor.price) || 1200;
      const gstEnabled = settings.gstEnabled === true;
      const gstPercent = gstEnabled ? (Number(settings.gstPercent) || 0) : 0;
      const gstAmount = gstPercent > 0 ? Math.round(baseFee * (gstPercent / 100)) : 0;
      
      // Calculate net total in INR
      const netTotal = baseFee + gstAmount;

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
        receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
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

      // 2. Verify student and counsellor profiles exist
      const user = await StorageService.findById('users', userId);
      const counsellor = await StorageService.findById('counsellors', counsellorId);

      if (!user) return res.status(404).json({ success: false, message: 'Student profile not found' });
      if (!counsellor) return res.status(404).json({ success: false, message: 'Counsellor not found' });

      // 3. Compute price for records
      const settings = await StorageService.findOne('settings') || {};
      const baseFee = Number(counsellor.price) || 1200;
      const gstEnabled = settings.gstEnabled === true;
      const gstPercent = gstEnabled ? (Number(settings.gstPercent) || 0) : 0;
      const gstAmount = gstPercent > 0 ? Math.round(baseFee * (gstPercent / 100)) : 0;
      const netTotal = baseFee + gstAmount;

      // 4. Create appointment
      const newAppointment = await StorageService.create('appointments', {
        userId,
        counsellorId,
        date,
        time,
        mode,
        status: 'PENDING',
        service: service || 'counselling',
        paymentStatus: 'PAID',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amountPaid: netTotal
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
