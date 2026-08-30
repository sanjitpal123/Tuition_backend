import Student from '../models/Student.model.js';
import Attendance from '../models/Attendance.model.js';
import Notification from '../models/Notification.model.js';
import Activity from '../models/Activity.model.js';
import { sendPushNotification } from '../services/firebase.service.js';
import bcrypt from 'bcryptjs';

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find({ tutorId: req.tutor._id }).populate('batchId', 'name').lean();
    
    // Fetch all attendance records for this tutor
    const attendanceRecords = await Attendance.find({ tutorId: req.tutor._id }).lean();
    
    // Calculate attendance per student
    const studentWithAttendance = students.map(student => {
      const studentRecords = attendanceRecords.filter(r => r.studentId && r.studentId.toString() === student._id.toString());
      let attendancePercentage = 100;
      if (studentRecords.length > 0) {
        const presentCount = studentRecords.filter(r => r.tution_present === true).length;
        attendancePercentage = Math.round((presentCount / studentRecords.length) * 100);
      }
      return { ...student, attendance: attendancePercentage };
    });

    res.json(studentWithAttendance);
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

    await Activity.create({
      tutorId: req.tutor._id,
      text: `Added new student: ${student.name}`,
      type: 'student'
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

    const updateData = { ...req.body };
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password; // Don't overwrite with empty string if not provided
    }

    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, tutorId: req.tutor._id },
      updateData,
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
    
    await Activity.create({
      tutorId: req.tutor._id,
      text: `Removed student: ${student.name}`,
      type: 'student'
    });

    res.json({ message: 'Student removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
