import Attendance from '../models/Attendance.model.js';

/**
 * Bulk save/update attendance for a batch on a specific date
 */
export const saveBatchAttendance = async (tutorId, batchId, date, attendanceRecords) => {
  const operations = attendanceRecords.map(record => ({
    updateOne: {
      filter: { 
        tutor_Id: tutorId, 
        batch_Id: batchId, 
        date: date, 
        student_Id: record.studentId 
      },
      update: {
        $set: {
          tution_present: record.tution_present,
          School_status: record.School_status
        }
      },
      upsert: true // Creates it if it doesn't exist for that date
    }
  }));

  if (operations.length > 0) {
    await Attendance.bulkWrite(operations);
  }
  return { success: true, count: operations.length };
};

/**
 * Get monthly stats for a specific student
 */
export const getMonthlyStats = async (tutorId, studentId, monthPrefix) => {
  // monthPrefix expected as "YYYY-MM" to match the string dates "YYYY-MM-DD"
  const records = await Attendance.find({
    tutor_Id: tutorId,
    student_Id: studentId,
    date: { $regex: `^${monthPrefix}` } // Matches any date starting with "YYYY-MM"
  });

  const stats = {
    totalClassesTracked: records.length,
    tuitionPresent: 0,
    tuitionAbsent: 0,
    tuitionLate: 0,
    schoolYes: 0,
    schoolNo: 0
  };

  records.forEach(record => {
    if (record.tution_present === 'Present') stats.tuitionPresent++;
    if (record.tution_present === 'Absent') stats.tuitionAbsent++;
    if (record.tution_present === 'Late') stats.tuitionLate++;
    
    if (record.School_status === 'Yes') stats.schoolYes++;
    if (record.School_status === 'No') stats.schoolNo++;
  });

  return stats;
};

/**
 * Get attendance records for a specific batch and date (to populate the UI)
 */
export const getBatchAttendanceByDate = async (tutorId, batchId, date) => {
  return await Attendance.find({ tutor_Id: tutorId, batch_Id: batchId, date });
};
