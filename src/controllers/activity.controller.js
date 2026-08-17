const Activity = require('../models/Activity.model');

exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ tutorId: req.tutor._id }).sort({ createdAt: -1 }).limit(10);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const { text, type } = req.body;
    const activity = await Activity.create({
      tutorId: req.tutor._id,
      text,
      type
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
