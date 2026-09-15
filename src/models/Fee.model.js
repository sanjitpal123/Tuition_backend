import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  amount: { type: Number, required: true },
  month: { type: String, required: true }, // Format: YYYY-MM
  paymentDate: { type: Date, default: Date.now },
  paymentMode: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'other'] },
  note: {
    type: String,
    max_length: 200,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Fee', feeSchema);
