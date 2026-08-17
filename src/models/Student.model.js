import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  feeStatus: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
