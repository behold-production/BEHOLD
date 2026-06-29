const express = require('express');
const AuthController = require('../controllers/authController');
const { verifyJWT } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, AuthController.registerUser);
router.post('/register-counsellor', validateRegister, AuthController.registerCounsellor);
router.post('/login', validateLogin, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// OTP routes
router.post('/send-otp', AuthController.sendOtp);
router.post('/verify-otp', AuthController.verifyOtp);

// Protected routes
router.post('/change-password', verifyJWT, AuthController.changePassword);
router.post('/logout', verifyJWT, AuthController.logout);

module.exports = router;
