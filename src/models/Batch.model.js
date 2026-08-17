const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  name: { type: String, required: true },
  class: { type: String },
  subject: { type: String },
  schedule: { type: String }, // e.g. "Mon, Wed, Fri"
  time: { type: String },     // e.g. "5:00 PM - 6:00 PM"
  fee: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
