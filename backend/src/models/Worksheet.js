const mongoose = require('mongoose');

const WorksheetSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Custom internal ID
  worksheetId: { type: String, required: true }, // Same as id usually
  clientId: { type: String, required: true },
  psychologistId: { type: String, required: true },
  sessionId: { type: String, required: true },
  
  // Original file uploaded by psychologist
  originalFileName: { type: String, required: true },
  storageKey: { type: String, required: true }, // Cloudinary public_id
  fileType: { type: String },
  fileSize: { type: Number },
  
  optionalMessage: { type: String },
  
  // DRAFT, SHARED, VIEWED, IN_PROGRESS, SUBMITTED
  status: { type: String, default: 'DRAFT' },
  
  // Security references
  secureAccessToken: { type: String, unique: true },
  
  // Submitted file
  submissionStorageKey: { type: String },
  submissionFileName: { type: String },
  
  // Timestamps
  sharedAt: { type: Date },
  completedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Worksheet', WorksheetSchema);
