import express from 'express';
const router = express.Router();
import { getStudents, createStudent, updateStudent, deleteStudent } from '../controllers/student.controller.js';
import { protect } from '../middleware/auth.middleware.js';

router.use(protect);

router.route('/')
  .get(getStudents)
  .post(createStudent);

router.route('/:id')
  .put(updateStudent)
  .delete(deleteStudent);

export default router;
