import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  name: { type: String, required: true },
  email: { type: String },
  password: { type: String }, // Hashed password for student login
  phone: { type: String },
  parentName: { type: String },
  parentPhone: { type: String },
  admissionDate: { type: Date },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  feeStatus: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  fees: { type: Number },
  fcmTokens: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
