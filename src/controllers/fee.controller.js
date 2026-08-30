import Fee from '../models/Fee.model.js';
import Student from '../models/Student.model.js';
import Notification from '../models/Notification.model.js';
import { sendPushNotification } from '../services/firebase.service.js';

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

    // Update the student's fee status to Paid
    const student = await Student.findOneAndUpdate(
      { _id: studentId, tutorId: req.tutor._id },
      { feeStatus: 'Paid' },
      { new: true }
    );

    if (student) {
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

    // If deleting for the current month, also reset the student's status
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (month === currentMonth) {
      await Student.findOneAndUpdate(
        { _id: studentId, tutorId: req.tutor._id },
        { feeStatus: 'Pending' }
      );
    }

    res.status(200).json({ message: 'Fee payment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
