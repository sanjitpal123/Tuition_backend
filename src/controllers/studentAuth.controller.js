import Student from '../models/Student.model.js';
import Batch from '../models/Batch.model.js';
import Announcement from '../models/Announcement.model.js';
import Attendance from '../models/Attendance.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    const students = await Student.find({ 
      $or: [{ email: email }, { phone: email }] 
    }).populate('tutorId', 'tuitionName name');
    
    // Check if any matching student has the correct password
    const matchedStudents = students.filter(s => s.password === password);
    
    if (matchedStudents.length > 0) {
      const primaryStudent = matchedStudents[0];
      
      const tuitions = matchedStudents.map(s => ({
        id: s.tutorId._id,
        name: s.tutorId.tuitionName || s.tutorId.name,
        studentId: s._id
      }));

      res.json({
        _id: primaryStudent.id,
        name: primaryStudent.name,
        email: primaryStudent.email,
        phone: primaryStudent.phone,
        batchId: primaryStudent.batchId,
        feeStatus: primaryStudent.feeStatus,
        tuitions: tuitions,
        token: generateToken(primaryStudent.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentDashboard = async (req, res) => {
  try {
    let studentId = req.student._id;
    
    // If a specific tuition is requested, find the corresponding student record
    if (req.query.tuitionId) {
      const specificStudent = await Student.findOne({
        tutorId: req.query.tuitionId,
        $or: [{ email: req.student.email }, { phone: req.student.phone }]
      });
      if (specificStudent) {
        studentId = specificStudent._id;
      }
    }
    
    const student = await Student.findById(studentId).populate('batchId', 'name class subject schedule time fee');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    // Fetch all tuitions for the user so the dashboard always has the list
    const allStudents = await Student.find({
      $or: [{ email: req.student.email }, { phone: req.student.phone }]
    }).populate('tutorId', 'tuitionName name');
    
    const tuitions = allStudents.map(s => ({
      id: s.tutorId._id,
      name: s.tutorId.tuitionName || s.tutorId.name,
      studentId: s._id
    }));
    
    // Fetch Announcements
    const announcements = await Announcement.find({
      tutorId: student.tutorId,
      $or: [
        { targetType: 'all' },
        { targetType: 'batch', targetId: student.batchId },
        { targetType: 'student', targetId: student._id }
      ]
    }).sort({ createdAt: -1 });

    // Fetch Homeworks
    const Homework = (await import('../models/Homework.model.js')).default;
    const homeworks = await Homework.find({
      tutorId: student.tutorId,
      batchId: student.batchId
    }).sort({ dueDate: 1 });
    
    // Fetch Attendance
    const attendanceRecords = await Attendance.find({ studentId: student._id });
    const totalAttended = attendanceRecords.filter(record => record.status === 'Present').length;
    
    res.json({
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        feeStatus: student.feeStatus,
        batch: student.batchId
      },
      tuitions,
      announcements,
      homeworks,
      attendance: {
        totalAttended,
        totalClasses: attendanceRecords.length,
        records: attendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date))
      },
      todaysClass: student.batchId ? {
        subject: student.batchId.subject,
        time: student.batchId.time,
        topic: 'Regular Class', // Mock for now
        room: 'Online/Classroom'
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.student._id;
    const { name, phone, password } = req.body;
    
    // We update all records with the same email so that the profile is consistent across all tuitions
    const studentsToUpdate = await Student.find({ email: req.student.email });
    
    if (studentsToUpdate.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (password) updateFields.password = password;

    await Student.updateMany({ email: req.student.email }, { $set: updateFields });
    
    // Return updated primary student
    const updatedStudent = await Student.findById(studentId);
    
    res.json({
      _id: updatedStudent.id,
      name: updatedStudent.name,
      email: updatedStudent.email,
      phone: updatedStudent.phone
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

