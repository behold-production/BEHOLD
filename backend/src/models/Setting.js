const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    heroTitle: { type: String, default: '' },
    heroSub: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    siteName: { type: String, default: '' },
    siteCopyright: { type: String, default: '' },
    showBanner: { type: Boolean, default: false },
    bannerNotice: { type: String, default: '' },
    termsOfUse: { type: String, default: '' },
    privacyPolicy: { type: String, default: '' },
    cdatGroupCode: { type: String, default: 'cdat@behold' },
    blockedIps: { type: [String], default: [] },
    enablePsychology: { type: Boolean, default: true },
    gstEnabled: { type: Boolean, default: false },
    gstPercent: { type: Number, default: 0 },
    promoCodes: [
      {
        code: { type: String, required: true },
        type: { type: String, enum: ['PERCENTAGE', 'FLAT'], required: true },
        value: { type: Number, required: true },
        isActive: { type: Boolean, default: true }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
