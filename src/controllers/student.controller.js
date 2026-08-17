const Student = require('../models/Student.model');

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({ tutorId: req.tutor._id }).populate('batchId', 'name');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, email, phone, batchId, status, feeStatus } = req.body;
    const student = await Student.create({
      tutorId: req.tutor._id,
      name,
      email,
      phone,
      batchId,
      status,
      feeStatus
    });
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, tutorId: req.tutor._id },
      req.body,
      { new: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ _id: req.params.id, tutorId: req.tutor._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
