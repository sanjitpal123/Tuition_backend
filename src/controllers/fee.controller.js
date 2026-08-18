import * as feeService from '../services/fee.service.js';

/**
 * @desc    Record a new fee payment
 * @route   POST /api/fees
 * @access  Private
 */
export const recordPayment = async (req, res) => {
  try {
    const { studentId, batchId, amount, month, paymentMethod, remarks } = req.body;
    
    if (!studentId || !batchId || !amount || !month) {
      return res.status(400).json({ message: 'Missing required payment fields' });
    }

    const payment = await feeService.recordPayment(req.tutor._id, req.body);
    return res.status(201).json(payment);
  } catch (error) {
    console.error('Error in recordPayment:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

/**
 * @desc    Get fee payments (with optional filters)
 * @route   GET /api/fees
 * @access  Private
 */
export const getPayments = async (req, res) => {
  try {
    // You can pass ?studentId=... or ?month=... in the query
    const payments = await feeService.getPayments(req.tutor._id, req.query);
    return res.status(200).json(payments);
  } catch (error) {
    console.error('Error in getPayments:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

/**
 * @desc    Delete a fee payment
 * @route   DELETE /api/fees/:id
 * @access  Private
 */
export const deletePayment = async (req, res) => {
  try {
    const payment = await feeService.deletePayment(req.tutor._id, req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    return res.status(200).json({ message: 'Payment deleted' });
  } catch (error) {
    console.error('Error in deletePayment:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
