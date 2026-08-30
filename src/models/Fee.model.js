import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  amount: { type: Number, required: true },
  month: { type: String, required: true }, // Format: YYYY-MM
  paymentDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Fee', feeSchema);
