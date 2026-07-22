const mongoose = require('mongoose');

const counsellorSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    role: { type: String, default: 'counsellor' },
    specialties: { type: [String], default: [] },
    qualifications: { type: [String], default: [] },
    experience: { type: String, default: '' },
    availability: { type: mongoose.Schema.Types.Mixed, default: {} },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'DELETED'], default: 'PENDING' },
    rejectionReason: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    modePreference: { type: String, default: 'BOTH' },
    // Extra fields matching Frontend UI / Onboarding
    bio: { type: String, default: '' },
    education: { type: String, default: '' },
    price: { type: Number, default: 1200 },
    lang: { type: String, default: 'English, Malayalam' },
    defaultMeetLink: { type: String, default: '' },
    hours: { type: Number, default: 0 },
    modes: { type: [String], default: ['ONLINE', 'OFFLINE', 'DOOR_STEP'] },
    title: { type: String, default: 'Consultant Psychologist' },
    profilePic: { type: String, default: '' },
    profilePicPublicId: { type: String, default: '' },
    googleRefreshToken: { type: String, default: '' },
    isTopFive: { type: Boolean, default: false },
    locationName: { type: String, default: '' },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    bankAccountNumber: { type: String, default: '' },
    bankIfscCode: { type: String, default: '' },
    bankAccountName: { type: String, default: '' },
    commissionPercent: { type: Number, default: 50 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Counsellor', counsellorSchema);
