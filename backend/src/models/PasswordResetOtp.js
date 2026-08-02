const mongoose = require('mongoose');

const passwordResetOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  otpCode: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Auto-delete expired OTPs after 10 minutes
passwordResetOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordResetOtp', passwordResetOtpSchema);
