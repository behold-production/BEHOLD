const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  permissions: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
