import * as attendanceService from '../services/attendance.service.js';

/**
 * @desc    Mark attendance for multiple students
 * @route   POST /api/attendance
 * @access  Private
 */
export const markAttendance = async (req, res) => {
  try {
    const { batchId, date, records } = req.body;
    
    if (!batchId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const result = await attendanceService.saveBatchAttendance(req.tutor._id, batchId, date, records);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in markAttendance:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

/**
 * @desc    Get attendance for a specific batch and date
 * @route   GET /api/attendance/batch/:batchId?date=YYYY-MM-DD
 * @access  Private
 */
export const getBatchAttendance = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required' });
    }

    const records = await attendanceService.getBatchAttendanceByDate(req.tutor._id, batchId, date);
    return res.status(200).json(records);
  } catch (error) {
    console.error('Error in getBatchAttendance:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

/**
 * @desc    Get monthly stats for a student
 * @route   GET /api/attendance/student/:studentId/stats?month=YYYY-MM
 * @access  Private
 */
export const getStudentStats = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month } = req.query; // Format expected: YYYY-MM

    if (!month) {
      return res.status(400).json({ message: 'Month query parameter (YYYY-MM) is required' });
    }

    const stats = await attendanceService.getMonthlyStats(req.tutor._id, studentId, month);
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error in getStudentStats:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
