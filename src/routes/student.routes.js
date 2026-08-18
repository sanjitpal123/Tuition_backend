import express from 'express';
const router = express.Router();
import { getStudents, createStudent, updateStudent, deleteStudent } from '../controllers/student.controller.js';
import { protect } from '../middleware/auth.middleware.js';

router.use(protect);

router.route('/')
  .get(getStudents)
  .post(createStudent);

router.post('/update/:id', updateStudent);
router.post('/delete/:id', deleteStudent);

export default router;
