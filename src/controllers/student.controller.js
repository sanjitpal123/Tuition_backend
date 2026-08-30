import Student from '../models/Student.model.js';
import Notification from '../models/Notification.model.js';
import { sendPushNotification } from '../services/firebase.service.js';
import bcrypt from 'bcryptjs';

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
    const { name, email, phone, parentName, parentPhone, admissionDate, batchId, status, feeStatus, password } = req.body;
    
    let hashedPassword = undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const student = await Student.create({
      tutorId: req.tutor._id,
      name,
      email,
      phone,
      parentName,
      parentPhone,
      admissionDate,
      password: hashedPassword,
      batchId,
      status,
      feeStatus
    });
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const existingStudent = await Student.findOne({ _id: req.params.id, tutorId: req.tutor._id });
    if (!existingStudent) return res.status(404).json({ message: 'Student not found' });

    const wasFeePending = existingStudent.feeStatus !== 'Paid';
    const isFeeNowPaid = req.body.feeStatus === 'Paid';

    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, tutorId: req.tutor._id },
      req.body,
      { new: true }
    );

    if (wasFeePending && isFeeNowPaid) {
      if (student.fcmTokens && student.fcmTokens.length > 0) {
        await sendPushNotification({
          tokens: student.fcmTokens,
          title: 'Fee Payment Received',
          body: `Your fee payment has been successfully recorded.`,
          data: { type: 'fee' }
        });
      }

      await Notification.create({
        recipientId: student._id,
        recipientModel: 'Student',
        title: 'Fee Payment Received',
        body: `Your fee payment has been successfully recorded.`,
        type: 'fee'
      });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
