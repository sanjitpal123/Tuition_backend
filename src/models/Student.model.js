import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  name: { type: String, required: true },
  email: { type: String },
  password: { type: String },
  phone: { type: String },
  parentName: { type: String },
  parentPhone: { type: String },
  dob: { type: Date },
  admissionDate: { type: Date },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  fees: { type: Number },
  fcmTokens: [{ type: String }],

  // Pre-computed fee status (updated by recalculateFeeStatus utility)
  feeStatus: {
    status: { type: String, enum: ['Paid', 'Pending', 'Overdue', 'Extra', 'New', 'paid', 'pending', 'new'], default: 'Pending' },
    nextDueDate: { type: Date },
    currentCycleStart: { type: Date },
    currentCycleEnd: { type: Date },
    totalPaid: { type: Number, default: 0 },
    totalExpected: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    paidCycles: { type: Number, default: 0 },
    lastPaidDate: { type: Date, default: null },
    lastUpdated: { type: Date, default: Date.now },
    overdueMonths: { type: Number, default: 0, index: true },
  }
}, { timestamps: true });

// Intercept raw MongoDB document before Mongoose hydration to fix legacy string feeStatus values in DB
studentSchema.pre('init', function(doc) {
  if (doc && typeof doc.feeStatus === 'string') {
    doc.feeStatus = {
      status: doc.feeStatus,
      overdueMonths: 0
    };
  }
});

export default mongoose.model('Student', studentSchema);