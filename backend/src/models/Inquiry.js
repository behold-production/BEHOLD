const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'PENDING' },
    note: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
