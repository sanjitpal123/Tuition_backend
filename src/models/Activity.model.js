const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ['payment', 'attendance', 'student', 'test', 'system'], default: 'system' },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
