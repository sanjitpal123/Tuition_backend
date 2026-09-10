import Fee from '../models/Fee.model.js';
import Student from '../models/Student.model.js';
import Notification from '../models/Notification.model.js';
import Activity from '../models/Activity.model.js';
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

    // Calculate total paid by this student for this month
    const allFeesThisMonth = await Fee.find({ studentId, month, tutorId: req.tutor._id });
    const totalPaidThisMonth = allFeesThisMonth.reduce((sum, f) => sum + f.amount, 0);

    const student = await Student.findOne({ _id: studentId, tutorId: req.tutor._id });
    
    if (student) {
      // Set to Paid if total paid is equal or greater than monthly fee, else Pending
      student.feeStatus = totalPaidThisMonth >= (student.fees || 0) ? 'Paid' : 'Pending';
      await student.save();

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
        text: `Recorded â‚¹${amount} payment from ${student.name}`,
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

    // If deleting for the current month, also reset the student's status
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (month === currentMonth) {
      const allFeesThisMonth = await Fee.find({ studentId, month, tutorId: req.tutor._id });
      const totalPaidThisMonth = allFeesThisMonth.reduce((sum, f) => sum + f.amount, 0);
      
      const studentInfo = await Student.findOne({ _id: studentId, tutorId: req.tutor._id });
      if (studentInfo) {
        studentInfo.feeStatus = totalPaidThisMonth >= (studentInfo.fees || 0) ? 'Paid' : 'Pending';
        await studentInfo.save();
        
        await Activity.create({
          tutorId: req.tutor._id,
          text: `Deleted payment record for ${studentInfo.name}`,
          type: 'payment'
        });
      }
    } else {
      const studentInfo = await Student.findById(studentId);
      if (studentInfo) {
        await Activity.create({
          tutorId: req.tutor._id,
          text: `Deleted payment record for ${studentInfo.name}`,
          type: 'payment'
        });
      }
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
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (month === currentMonth) {
        studentInfo.feeStatus = amount >= (studentInfo.fees || 0) ? 'Paid' : 'Pending';
        await studentInfo.save();
      }
      
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

