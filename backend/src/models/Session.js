const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    appointmentId: { type: String, required: true },
    userId: { type: String, required: true },
    counsellorId: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: { type: String, required: true },
    meetLink: { type: String, default: '' },
    status: { type: String, default: 'PENDING' },
    notes: { type: String, default: '' },
    feedback: { type: String, default: '' },
    nextSession: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
    cancelledBy: { type: String, default: '' },
    clientLocationName: { type: String, default: '' },
    clientLatitude: { type: Number, default: 0 },
    clientLongitude: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
