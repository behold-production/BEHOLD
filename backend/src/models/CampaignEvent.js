const mongoose = require('mongoose');

const campaignEventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    eventName: { type: String, required: true },
    eventId: { type: String, default: '' },
    utmSource: { type: String, default: '' },
    utmMedium: { type: String, default: '' },
    utmCampaign: { type: String, default: '' },
    utmContent: { type: String, default: '' },
    utmTerm: { type: String, default: '' },
    fbclid: { type: String, default: '' },
    fbp: { type: String, default: '' },
    fbc: { type: String, default: '' },
    url: { type: String, default: '' },
    userId: { type: String, default: '' },
    userEmail: { type: String, default: '' },
    userPhone: { type: String, default: '' },
    value: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    customData: { type: mongoose.Schema.Types.Mixed, default: {} },
    capiStatus: { type: String, default: 'SAVED_LOCAL' },
    metaResponse: { type: mongoose.Schema.Types.Mixed, default: null }
  },
  { timestamps: true }
);

campaignEventSchema.index({ eventName: 1, createdAt: -1 });
campaignEventSchema.index({ eventId: 1 });
campaignEventSchema.index({ utmCampaign: 1, utmSource: 1 });
campaignEventSchema.index({ capiStatus: 1 });

module.exports = mongoose.model('CampaignEvent', campaignEventSchema);
