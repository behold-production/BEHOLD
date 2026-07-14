const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    sessionId: { type: String, required: true },
    appointmentId: { type: String, required: true },
    userId: { type: String, required: true },
    counsellorId: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, default: '' },
    isModerated: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
