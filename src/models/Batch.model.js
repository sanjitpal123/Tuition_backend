import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  name: { type: String, required: true },
  class: { type: String },
  fees: {
    type: String
  },
  subjects: [{ type: String }]

}, { timestamps: true });

export default mongoose.model('Batch', batchSchema);
