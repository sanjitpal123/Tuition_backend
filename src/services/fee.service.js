import FeePayment from '../models/FeePayment.model.js';
import Student from '../models/Student.model.js';

export const recordPayment = async (tutorId, paymentData) => {
  // 1. Create the payment record
  const payment = await FeePayment.create({
    tutorId,
    ...paymentData
  });

  // 2. Automatically update the student's feeStatus to 'Paid'
  if (paymentData.studentId) {
    await Student.findByIdAndUpdate(paymentData.studentId, { feeStatus: 'Paid' });
  }

  return payment;
};

export const getPayments = async (tutorId, filters = {}) => {
  const query = { tutorId, ...filters };
  return await FeePayment.find(query)
    .populate('studentId', 'name email phone')
    .populate('batchId', 'name')
    .sort({ paymentDate: -1 });
};

export const deletePayment = async (tutorId, paymentId) => {
  return await FeePayment.findOneAndDelete({ _id: paymentId, tutorId });
};
