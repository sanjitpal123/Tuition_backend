import express from 'express';
const router = express.Router();
import { getClasses, createClass, createBulkClasses, updateClass, deleteClass } from '../controllers/class.controller.js';
import { protect } from '../middleware/auth.middleware.js';

router.use(protect);

router.route('/')
  .get(getClasses)
  .post(createClass);

router.post('/bulk', createBulkClasses);

router.route('/:id')
  .put(updateClass)
  .delete(deleteClass);

export default router;
