import express from 'express';
import { getFees, recordFeePayment, deleteFeePayment, deleteFeePaymentById, updateFeePayment } from '../controllers/fee.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // Ensure all fee routes are protected by Tutor authentication

router.get('/', getFees);
router.post('/', recordFeePayment);
router.delete('/item/:id', deleteFeePaymentById);
router.put('/:studentId/:month', updateFeePayment);
router.delete('/:studentId/:month', deleteFeePayment);

export default router;
