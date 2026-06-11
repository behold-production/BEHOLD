const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  date: { type: String, required: true },
  dominantDomain: { type: String, required: true },
  scores: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('TestResult', testResultSchema);
