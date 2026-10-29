const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  otpCode: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  // Wrong-code tries, so a intercepted 6-digit string cannot be brute forced.
  attempts: { type: Number, default: 0 },
  // What the WhatsApp provider reported: 'sent' | 'failed' | 'not_configured'
  deliveryStatus: { type: String, default: '' },
  deliveryError: { type: String, default: '' }
}, {
  timestamps: true
});

// Codes are single-use and short-lived — let Mongo reclaim them once stale.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ phone: 1, createdAt: -1 });

module.exports = mongoose.model('Otp', otpSchema);
