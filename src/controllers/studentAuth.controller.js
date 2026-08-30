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
    const { email, password } = req.body; // 'email' can be email or phone
    const student = await Student.findOne({ 
      $or: [{ email: email }, { phone: email }] 
    });
    
    if (student && student.password && (await bcrypt.compare(password, student.password))) {
      res.json({
        _id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        batchId: student.batchId,
        feeStatus: student.feeStatus,
        token: generateToken(student.id)
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
    const studentId = req.student._id;
    
    const student = await Student.findById(studentId).populate('batchId', 'name class subject schedule time fee');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    // Fetch Announcements
    const announcements = await Announcement.find({
      tutorId: student.tutorId,
      $or: [
        { targetType: 'all' },
        { targetType: 'batch', targetId: student.batchId },
        { targetType: 'student', targetId: student._id }
      ]
    }).sort({ createdAt: -1 });
    
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
      announcements,
      attendance: {
        totalAttended,
        totalClasses: attendanceRecords.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
