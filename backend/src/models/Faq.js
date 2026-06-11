const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Faq', faqSchema);
