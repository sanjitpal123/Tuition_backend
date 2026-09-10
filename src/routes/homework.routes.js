import express from 'express';
import upload from '../config/multer.js';
import { createHomework, getHomeworks, getHomeworkById, deleteHomework } from '../controllers/homework.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getHomeworks)
  .post(upload.single('image'), createHomework);

router.route('/:id')
  .get(getHomeworkById)
  .delete(deleteHomework);

export default router;
