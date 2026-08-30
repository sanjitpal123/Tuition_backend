import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: String, required: true }, // Format: 'yyyy-MM-dd'
  tution_present: { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
  School_status: { type: String, enum: ['Yes', 'No'], required: true }
}, { timestamps: true });

// Ensure unique attendance per student per date per batch
attendanceSchema.index({ batchId: 1, studentId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
