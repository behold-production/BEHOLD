const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    counsellorId: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: { type: String, required: true },
    status: { type: String, default: 'PENDING' },
    meetLink: { type: String, default: '' },
    notes: { type: String, default: '' },
    feedback: { type: String, default: '' },
    nextSession: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    service: { type: String, default: 'counselling' },
    cancellationReason: { type: String, default: '' },
    cancelledBy: { type: String, default: '' },
    rescheduleCount: { type: Number, default: 0 },
    lastRescheduledAt: { type: Date, default: null },
    paymentStatus: { type: String, default: 'PENDING', enum: ['PENDING', 'PAID', 'FAILED'] },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    amountPaid: { type: Number, default: 0 },
    clientLocationName: { type: String, default: '' },
    clientLatitude: { type: Number, default: 0 },
    clientLongitude: { type: Number, default: 0 },
    refundStatus: { type: String, enum: ['NONE', 'PENDING', 'REFUNDED', 'REJECTED'], default: 'NONE' },
    refundId: { type: String, default: '' },
    refundedAt: { type: Date, default: null },
    razorpaySplitError: { type: String, default: '' },
    commissionPercent: { type: Number, default: 50 },
    counsellorShareAmount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
