const Announcement = require('../models/Announcement.model');

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ tutorId: req.tutor._id }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAnnouncement = async (req, res) => {
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
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
