import Notification from '../models/Notification.model.js';
import Student from '../models/Student.model.js';
import Tutor from '../models/Tutor.model.js';

export const saveToken = async (req, res) => {
  try {
    const { token, role } = req.body;
    if (!token || !role) {
      return res.status(400).json({ message: 'Token and role are required' });
    }

    let user;
    if (role === 'student') {
      user = await Student.findById(req.body.studentId); // For now, allow tutor to set it, or assume studentId is passed
    } else if (role === 'tutor') {
      user = await Tutor.findById(req.tutor._id); 
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.fcmTokens) {
      user.fcmTokens = [];
    }
    
    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
      await user.save();
    }

    res.status(200).json({ message: 'Token saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    let recipientId = req.tutor ? req.tutor._id : null;
    
    if (!recipientId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notifications = await Notification.find({ recipientId }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    let recipientId = req.tutor ? req.tutor._id : null;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
