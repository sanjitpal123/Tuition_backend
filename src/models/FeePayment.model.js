import mongoose from 'mongoose';

const feePaymentSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  
  amount: { type: Number, required: true },
  month: { type: String, required: true }, // e.g., "August 2026" or "2026-08"
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Other'], 
    default: 'Cash' 
  },
  remarks: { type: String }
}, { timestamps: true });

export default mongoose.model('FeePayment', feePaymentSchema);
