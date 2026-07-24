const mongoose = require('mongoose');

const whatsappMessageSchema = new mongoose.Schema(
  {
    wamid: { type: String, unique: true, sparse: true },
    from: { type: String, required: true },
    senderName: { type: String },
    phoneNumberId: { type: String },
    displayPhoneNumber: { type: String },
    messageType: { type: String, default: 'text' },
    textBody: { type: String },
    rawPayload: { type: Object },
    status: { type: String, enum: ['sent', 'delivered', 'read', 'failed', 'received'], default: 'received' },
    direction: { type: String, enum: ['incoming', 'outgoing'], default: 'incoming' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('WhatsAppMessage', whatsappMessageSchema);
