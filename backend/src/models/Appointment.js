const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  counsellorId: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  mode: { type: String, required: true },
  status: { type: String, default: 'PENDING' },
  meetLink: { type: String, default: '' },
  feedback: { type: String, default: '' },
  service: { type: String, default: 'counselling' },
  cancellationReason: { type: String, default: '' },
  cancelledBy: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
