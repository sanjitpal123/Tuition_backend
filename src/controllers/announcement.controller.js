import Announcement from '../models/Announcement.model.js';
import Student from '../models/Student.model.js';
import Notification from '../models/Notification.model.js';
import { sendPushNotification } from '../services/firebase.service.js';

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ tutorId: req.tutor._id }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, targetType, targetId, audience } = req.body;
    const announcement = await Announcement.create({
      tutorId: req.tutor._id,
      title,
      message,
      targetType,
      targetId,
      audience
    });

    // Send push notification to all active students of this tutor
    // Note: If you want to target specific batches based on targetType, you would filter here.
    const students = await Student.find({ tutorId: req.tutor._id, status: 'Active' });
    const tokens = students.reduce((acc, student) => acc.concat(student.fcmTokens || []), []);
    
    if (tokens.length > 0) {
      await sendPushNotification({
        tokens,
        title: `New Announcement: ${title}`,
        body: message,
        data: { type: 'announcement', announcementId: announcement._id.toString() }
      });
    }

    // Optionally create Notification records for each student
    for (const student of students) {
      await Notification.create({
        recipientId: student._id,
        recipientModel: 'Student',
        title: `New Announcement: ${title}`,
        body: message,
        type: 'announcement'
      });
    }

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
