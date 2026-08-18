import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  student_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  tutor_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true
  },
  batch_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  date: {
    type: String, // e.g., 'YYYY-MM-DD'
    required: true
  },
  tution_present: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    default: 'Present'
  },
  School_status: {
    type: String,
    enum: ['Yes', 'No']
  }
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);
