import Class from '../models/Class.model.js';

export const getClasses = async (req, res) => {
  try {
    const classes = await Class.find({ tutorId: req.tutor._id }).populate('batchId', 'name class subject fee');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createClass = async (req, res) => {
  try {
    const { batchId, date, time, subject, status } = req.body;
    const newClass = await Class.create({
      tutorId: req.tutor._id,
      batchId,
      date,
      time,
      subject,
      status
    });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateClass = async (req, res) => {
  try {
    const updatedClass = await Class.findOneAndUpdate(
      { _id: req.params.id, tutorId: req.tutor._id },
      req.body,
      { new: true }
    );
    if (!updatedClass) return res.status(404).json({ message: 'Class not found' });
    res.json(updatedClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const deletedClass = await Class.findOneAndDelete({ _id: req.params.id, tutorId: req.tutor._id });
    if (!deletedClass) return res.status(404).json({ message: 'Class not found' });
    res.json({ message: 'Class removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
