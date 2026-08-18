import Student from '../models/Student.model.js';

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find({ tutorId: req.tutor._id }).populate('batchId', 'name');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { name, email, phone, batchId, status, feeStatus, parent_name, parent_phone, address, fees } = req.body;
    
    // Safely handle batchId to avoid Cast to ObjectId errors
    let safeBatchId = batchId;
    if (!safeBatchId || safeBatchId === '' || safeBatchId === 'test') {
      safeBatchId = undefined; // Let mongoose handle it as unset
    }

    const student = await Student.create({
      tutorId: req.tutor._id,
      name,
      email,
      phone,
      batchId: safeBatchId,
      status,
      feeStatus,
      parent_name,
      parent_phone,
      address,
      fees
    });
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.batchId === '' || updateData.batchId === 'test') {
      updateData.batchId = undefined; // Avoid casting issues
    }
    
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, tutorId: req.tutor._id },
      { $set: updateData },
      { new: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ _id: req.params.id, tutorId: req.tutor._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
