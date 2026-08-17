import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetType: { type: String, enum: ['all', 'batch', 'student'], default: 'all' },
  targetId: { type: mongoose.Schema.Types.ObjectId }, // null if all, batchId if batch, studentId if student
  audience: { type: String, enum: ['students', 'parents', 'both'], default: 'both' }
}, { timestamps: true });

export default mongoose.model('Announcement', announcementSchema);
