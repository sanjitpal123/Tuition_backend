import Batch from '../models/Batch.model.js';
import Student from '../models/Student.model.js';
import Attendance from '../models/Attendance.model.js';
import Activity from '../models/Activity.model.js';

export const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find({ tutorId: req.tutor._id });
    
    // We can also attach student count to each batch if needed
    const batchesWithCount = await Promise.all(batches.map(async (batch) => {
      const studentsCount = await Student.countDocuments({ batchId: batch._id });
      
      // Calculate real-time attendance
      const records = await Attendance.find({ batchId: batch._id });
      let attendanceAvg = 100; // Default to 100% if no attendance taken yet
      
      if (records.length > 0) {
        const totalPresent = records.filter(r => r.tution_present === 'Present').length;
        attendanceAvg = Math.round((totalPresent / records.length) * 100);
      }
      
      // Calculate today's attendance for the dashboard
      const todayStr = new Date().toLocaleDateString('en-CA'); // 'yyyy-MM-dd' in local timezone
      const todayRecords = records.filter(r => r.date === todayStr);
      const presentCount = todayRecords.filter(r => r.tution_present === 'Present').length;
      const absentCount = todayRecords.filter(r => r.tution_present === 'Absent').length;
      
      return { ...batch.toObject(), studentsCount, attendanceAvg, presentCount, absentCount, totalRecords: records.length };
    }));

    res.json(batchesWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBatch = async (req, res) => {
  try {
    const { name, className, subject, schedule, time, fee } = req.body;
    const batch = await Batch.create({
      tutorId: req.tutor._id,
      name,
      class: className,
      subject,
      schedule,
      time,
      fee
    });

    await Activity.create({
      tutorId: req.tutor._id,
      text: `Created new batch: ${batch.name}`,
      type: 'system'
    });

    res.status(201).json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findOneAndUpdate(
      { _id: req.params.id, tutorId: req.tutor._id },
      req.body,
      { new: true }
    );
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findOneAndDelete({ _id: req.params.id, tutorId: req.tutor._id });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json({ message: 'Batch removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
