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
    duration: { type: String, default: '1 Hour (60 Mins)' },
    baseFee: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    appliedDiscount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
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
    utmSource: { type: String, default: '' },
    utmMedium: { type: String, default: '' },
    utmCampaign: { type: String, default: '' },
    utmContent: { type: String, default: '' },
    utmTerm: { type: String, default: '' },
    fbclid: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

appointmentSchema.index({ userId: 1, date: -1 });
appointmentSchema.index({ counsellorId: 1, date: 1, time: 1 });
appointmentSchema.index({ status: 1, paymentStatus: 1 });
appointmentSchema.index({ razorpayOrderId: 1 });
appointmentSchema.index({ utmCampaign: 1, utmSource: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
