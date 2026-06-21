const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
