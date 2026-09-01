import mongoose from 'mongoose';

const homeworkSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model('Homework', homeworkSchema);
