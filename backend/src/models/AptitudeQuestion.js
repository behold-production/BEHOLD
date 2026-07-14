const mongoose = require('mongoose');

const aptitudeQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    category: { type: String, required: true },
    options: [
      {
        text: { type: String, required: true },
        weight: { type: Number, required: true }
      }
    ],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Optional: Transform the JSON output to include 'id' instead of '_id'
aptitudeQuestionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('AptitudeQuestion', aptitudeQuestionSchema);
