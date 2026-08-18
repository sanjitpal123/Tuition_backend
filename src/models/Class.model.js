import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  subject: { type: String, required: true },
  status: { type: String, enum: ['Upcoming', 'Completed', 'Cancelled'], default: 'Upcoming' },

}, { timestamps: true });

export default mongoose.model('Class', classSchema);
