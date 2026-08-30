import express from 'express';
import { getFees, recordFeePayment } from '../controllers/fee.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // Ensure all fee routes are protected by Tutor authentication

router.get('/', getFees);
router.post('/', recordFeePayment);

export default router;
