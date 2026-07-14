const express = require('express');
const PaymentController = require('../controllers/paymentController');
const { verifyJWT } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create Razorpay Order
router.post('/order', verifyJWT, PaymentController.createOrder);

// Route to verify Razorpay signature and finalize booking
router.post('/verify', verifyJWT, PaymentController.verifyPaymentAndBook);

module.exports = router;
