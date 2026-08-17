import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ['payment', 'attendance', 'student', 'test', 'system'], default: 'system' },
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);
