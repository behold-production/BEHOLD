const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    age: { type: String, default: '' },
    feelingLately: { type: String, default: '' },
    hadPriorTherapy: { type: String, default: '' },
    priorTherapyDetails: { type: String, default: '' },
    schoolName: { type: String, default: '' },
    grade: { type: String, default: '' },
    guardianName: { type: String, default: '' },
    guardianPhone: { type: String, default: '' },
    groupCode: { type: String, default: '' },
    role: { type: String, default: 'user' },
    status: { type: String, default: 'ACTIVE' },
    rejectionReason: { type: String, default: '' },
    permissions: { type: [String], default: [] },
    customRoleTitle: { type: String, default: '' },
    profilePic: { type: String, default: '' },
    profilePicPublicId: { type: String, default: '' },
    rescheduleCountToday: { type: Number, default: 0 },
    lastRescheduleDate: { type: String, default: '' },
    locationName: { type: String, default: '' },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    utmSource: { type: String, default: '' },
    utmMedium: { type: String, default: '' },
    utmCampaign: { type: String, default: '' },
    fbclid: { type: String, default: '' },
    isProfileCompleted: { type: Boolean, default: false },
    hasUsedIntroductory: { type: Boolean, default: false },
    cigiResults: {
      type: [
        {
          id: { type: String, required: true },
          fileUrl: { type: String, required: true },
          publicId: { type: String, default: '' },
          fileType: { type: String, required: true }, // 'image' or 'pdf'
          testDate: { type: String, default: '' },
          testTime: { type: String, default: '' },
          note: { type: String, default: '' },
          uploadedAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

userSchema.index({ phone: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ isProfileCompleted: 1 });
userSchema.index({ hasUsedIntroductory: 1 });
userSchema.index({ utmCampaign: 1, utmSource: 1 });

module.exports = mongoose.model('User', userSchema);
