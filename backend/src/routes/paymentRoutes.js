const express = require('express');
const PaymentController = require('../controllers/paymentController');
const { verifyJWT } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes to create Razorpay Order
router.post('/create-order', verifyJWT, PaymentController.createOrder);
router.post('/order', verifyJWT, PaymentController.createOrder);

// Routes to verify Razorpay signature
router.post('/verify-payment', verifyJWT, PaymentController.verifyPaymentAndBook);
router.post('/verify', verifyJWT, PaymentController.verifyPaymentAndBook);

// Public Razorpay Webhook Routes (No JWT verification since requests originate from Razorpay servers)
router.post('/webhook', PaymentController.handleWebhook);
router.post('/razorpay-webhook', PaymentController.handleWebhook);

module.exports = router;
