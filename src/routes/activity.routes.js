import express from 'express';
const router = express.Router();
import { getActivities, createActivity } from '../controllers/activity.controller.js';
import { protect } from '../middleware/auth.middleware.js';

router.use(protect);

router.route('/')
  .get(getActivities)
  .post(createActivity);

export default router;
