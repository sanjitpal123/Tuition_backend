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
    const populated = await Class.findById(newClass._id).populate('batchId', 'name class subject fee');
    res.status(201).json(populated || newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBulkClasses = async (req, res) => {
  try {
    const { classes } = req.body;
    if (!classes || !Array.isArray(classes) || classes.length === 0) {
      return res.status(400).json({ message: 'No classes provided for scheduling.' });
    }

    const classesToInsert = classes.map(c => ({
      ...c,
      tutorId: req.tutor._id,
      status: c.status || 'Upcoming'
    }));

    const inserted = await Class.insertMany(classesToInsert, { ordered: false });
    const populated = await Class.find({ _id: { $in: inserted.map(i => i._id) } })
      .populate('batchId', 'name class subject fee');

    res.status(201).json({
      message: `Successfully scheduled ${inserted.length} classes.`,
      classes: populated
    });
  } catch (error) {
    // If partial insert succeeded with duplicate key error, we can still fetch inserted ones
    if (error.insertedDocs && error.insertedDocs.length > 0) {
      const populated = await Class.find({ _id: { $in: error.insertedDocs.map(i => i._id) } })
        .populate('batchId', 'name class subject fee');
      return res.status(201).json({
        message: `Successfully scheduled ${error.insertedDocs.length} classes.`,
        classes: populated
      });
    }
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
