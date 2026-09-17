import express from 'express';
import { getFees, recordFeePayment, deleteFeePayment, updateFeePayment, deleteFeePaymentById, getOverdueStudents } from '../controllers/fee.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // Ensure all fee routes are protected by Tutor authentication

router.get('/', getFees);
router.post('/', recordFeePayment);
router.put('/:studentId/:month', updateFeePayment);
router.delete('/item/:feeId', deleteFeePaymentById);
router.delete('/:studentId/:month', deleteFeePayment);
router.get('/due-students', getOverdueStudents)

export default router;
