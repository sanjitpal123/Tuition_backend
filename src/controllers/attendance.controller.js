import Attendance from '../models/Attendance.model.js';
import Batch from '../models/Batch.model.js';
import Activity from '../models/Activity.model.js';
import mongoose from 'mongoose';

export const saveAttendance = async (req, res) => {
  try {
    const { batchId, date, records } = req.body;
    
    if (!batchId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const tutorId = req.tutor._id;

    // Use bulkWrite for efficient upserts
    const ops = records.map(record => ({
      updateOne: {
        filter: { 
          batchId: new mongoose.Types.ObjectId(batchId), 
          studentId: new mongoose.Types.ObjectId(record.studentId), 
          date 
        },
        update: {
          $set: {
            tutorId: new mongoose.Types.ObjectId(tutorId),
            tution_present: record.tution_present,
            School_status: record.School_status
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(ops);

    const batch = await Batch.findById(batchId);
    if (batch) {
      await Activity.create({
        tutorId: req.tutor._id,
        text: `Marked attendance for ${batch.name}`,
        type: 'attendance'
      });
    }

    res.status(200).json({ message: 'Attendance saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendanceByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { date } = req.query;

    if (!batchId || !date) {
      return res.status(400).json({ message: 'Batch ID and date are required' });
    }

    const attendanceRecords = await Attendance.find({ 
      batchId, 
      date,
      tutorId: req.tutor._id
    });

    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getStudentStats = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month } = req.query; // format: 'YYYY-MM'

    if (!studentId || !month) {
      return res.status(400).json({ message: 'Student ID and month are required' });
    }

    const records = await Attendance.find({
      studentId,
      tutorId: req.tutor._id,
      date: { $regex: '^' + month }
    });

    if (records.length === 0) {
      return res.status(200).json(null);
    }

    const stats = {
      tuitionPresent: 0,
      tuitionAbsent: 0,
      tuitionLate: 0,
      schoolYes: 0,
      schoolNo: 0
    };

    records.forEach(r => {
      if (r.tution_present === 'Present') stats.tuitionPresent++;
      else if (r.tution_present === 'Absent') stats.tuitionAbsent++;
      else if (r.tution_present === 'Late') stats.tuitionLate++;

      if (r.School_status === 'Yes') stats.schoolYes++;
      else if (r.School_status === 'No') stats.schoolNo++;
    });

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
