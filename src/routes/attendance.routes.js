import express from 'express';
const router = express.Router();
import { markAttendance, getBatchAttendance, getStudentStats } from '../controllers/attendance.controller.js';
import { protect } from '../middleware/auth.middleware.js';

router.use(protect);

router.post('/', markAttendance);
router.get('/batch/:batchId', getBatchAttendance);
router.get('/student/:studentId/stats', getStudentStats);

export default router;
