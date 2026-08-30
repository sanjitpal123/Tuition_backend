import express from 'express';
import { saveAttendance, getAttendanceByBatch } from '../controllers/attendance.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // Require tutor authentication for all attendance routes

router.post('/', saveAttendance);
router.get('/batch/:batchId', getAttendanceByBatch);

export default router;
