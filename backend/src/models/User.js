const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  permissions: { type: [String], default: [] },
  customRoleTitle: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
