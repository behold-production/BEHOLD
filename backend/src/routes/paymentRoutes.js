const express = require('express');
const PaymentController = require('../controllers/paymentController');
const { verifyJWT, optionalJWT } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes to create Razorpay Order
router.post('/create-order', optionalJWT, PaymentController.createOrder);
router.post('/order', optionalJWT, PaymentController.createOrder);

// Routes to verify Razorpay signature
router.post('/verify-payment', optionalJWT, PaymentController.verifyPaymentAndBook);
router.post('/verify', optionalJWT, PaymentController.verifyPaymentAndBook);

// Public Razorpay Webhook Routes (No JWT verification since requests originate from Razorpay servers)
router.post('/webhook', PaymentController.handleWebhook);
router.post('/razorpay-webhook', PaymentController.handleWebhook);

module.exports = router;
