import express from 'express';
import { loginStudent, getStudentDashboard, updateStudentProfile } from '../controllers/studentAuth.controller.js';
import { protectStudent } from '../middleware/student.middleware.js';

const router = express.Router();

router.post('/login', loginStudent);
router.get('/dashboard', protectStudent, getStudentDashboard);
router.put('/profile', protectStudent, updateStudentProfile);

export default router;
