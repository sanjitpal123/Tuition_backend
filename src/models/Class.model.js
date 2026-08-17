const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  subject: { type: String, required: true },
  status: { type: String, enum: ['Upcoming', 'Completed', 'Cancelled'], default: 'Upcoming' },
  attendanceMarked: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
