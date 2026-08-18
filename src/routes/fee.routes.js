import express from 'express';
const router = express.Router();
import { recordPayment, getPayments, deletePayment } from '../controllers/fee.controller.js';
import { protect } from '../middleware/auth.middleware.js';

router.use(protect);

router.post('/', recordPayment);
router.get('/', getPayments);
router.post('/delete/:id', deletePayment);

export default router;
