import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'recipientModel' },
  recipientModel: { type: String, required: true, enum: ['Student', 'Tutor'] },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, enum: ['fee', 'announcement', 'general'], default: 'general' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
