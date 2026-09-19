import Fee from '../models/Fee.model.js';
import Student from '../models/Student.model.js';
import Notification from '../models/Notification.model.js';
import Activity from '../models/Activity.model.js';
import { sendPushNotification } from '../services/firebase.service.js';
import recalculateFeeStatus from '../utils/recalculateFeeStatus.js';
export const getFees = async (req, res) => {
  try {
    const fees = await Fee.find({ tutorId: req.tutor._id })
      .populate('studentId', 'name email phone')
      .populate('batchId', 'name');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const recordFeePayment = async (req, res) => {
  try {
    const { studentId, batchId, amount, month } = req.body;

    // Create the fee record
    const fee = await Fee.create({
      tutorId: req.tutor._id,
      studentId,
      batchId,
      amount,
      month
    });

    // Calculate total paid by this student for this month
    const allFeesThisMonth = await Fee.find({ studentId, month, tutorId: req.tutor._id });
    const totalPaidThisMonth = allFeesThisMonth.reduce((sum, f) => sum + f.amount, 0);

    const student = await Student.findOne({ _id: studentId, tutorId: req.tutor._id });

    if (student) {
      await recalculateFeeStatus(student._id);

      if (student.fcmTokens && student.fcmTokens.length > 0) {
        await sendPushNotification({
          tokens: student.fcmTokens,
          title: 'Fee Payment Received',
          body: `Your fee payment for ${month} has been successfully recorded.`,
          data: { type: 'fee' }
        });
      }

      await Notification.create({
        recipientId: student._id,
        recipientModel: 'Student',
        title: 'Fee Payment Received',
        body: `Your fee payment for ${month} has been successfully recorded.`,
        type: 'fee'
      });

      await Activity.create({
        tutorId: req.tutor._id,
        text: `Recorded amount:${amount} payment from ${student.name}`,
        type: 'payment'
      });
    }

    res.status(201).json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFeePayment = async (req, res) => {
  try {
    const { studentId, month } = req.params;

    // Delete the specific fee record
    const fee = await Fee.findOneAndDelete({
      tutorId: req.tutor._id,
      studentId: studentId,
      month: month
    });

    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found for this month' });
    }

    const studentInfo = await Student.findOne({ _id: studentId, tutorId: req.tutor._id });
    if (studentInfo) {
      await recalculateFeeStatus(studentId);
      await Activity.create({
        tutorId: req.tutor._id,
        text: `Deleted payment record for ${studentInfo.name}`,
        type: 'payment'
      });
    }

    res.status(200).json({ message: 'Fee payment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateFeePayment = async (req, res) => {
  try {
    const { studentId, month } = req.params;
    const { amount } = req.body;

    // Delete all fee records for this month
    await Fee.deleteMany({
      tutorId: req.tutor._id,
      studentId: studentId,
      month: month
    });

    const studentInfo = await Student.findOne({ _id: studentId, tutorId: req.tutor._id });
    let newFee = null;

    if (amount > 0) {
      newFee = await Fee.create({
        tutorId: req.tutor._id,
        studentId,
        batchId: studentInfo ? studentInfo.batchId : null,
        amount,
        month
      });
    }

    if (studentInfo) {
      await recalculateFeeStatus(studentId);
      await Activity.create({
        tutorId: req.tutor._id,
        text: `Updated payment record for ${studentInfo.name} to ₹${amount}`,
        type: 'payment'
      });
    }
    res.status(200).json(newFee || { message: 'Fees updated to 0' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFeePaymentById = async (req, res) => {
  try {
    const { feeId } = req.params;

    // Delete the specific fee record
    const fee = await Fee.findOneAndDelete({
      _id: feeId,
      tutorId: req.tutor._id
    });

    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    const { studentId } = fee;
    const studentInfo = await Student.findOne({ _id: studentId, tutorId: req.tutor._id });
    if (studentInfo) {
      await recalculateFeeStatus(studentId);
      await Activity.create({
        tutorId: req.tutor._id,
        text: `Deleted payment record for ${studentInfo.name}`,
        type: 'payment'
      });
    }
    res.status(200).json({ message: 'Fee payment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/fee.controller.js

export const getOverdueStudents = async (req, res) => {
  try {
    const students = await Student.find({ tutorId: req.tutor._id, fees: { $gt: 0 } });
    for (const student of students) {
      try {
        await recalculateFeeStatus(student._id);
      } catch (err) {
        console.error(`Failed recalculation for student ${student._id}:`, err);
      }
    }

    const minMonths = 1;
    // Instant MongoDB query using indexed field
    const overdueStudents = await Student.find({
      tutorId: req.tutor._id,
      'feeStatus.overdueMonths': { $gte: minMonths }
    })
      .populate('batchId', 'name')
      .sort({ 'feeStatus.overdueMonths': -1 }); // Worst defaulters first!

    res.json(overdueStudents);
  } catch (error) {
    console.error('Error in getOverdueStudents:', error);
    res.status(500).json({ message: error.message });
  }
};