import express from 'express';
const router = express.Router();
import { getClasses, createClass, updateClass, deleteClass } from '../controllers/class.controller.js';
import { protect } from '../middleware/auth.middleware.js';

router.use(protect);

router.route('/')
  .get(getClasses)
  .post(createClass);

router.post('/update/:id', updateClass);
router.post('/delete/:id', deleteClass);

export default router;
