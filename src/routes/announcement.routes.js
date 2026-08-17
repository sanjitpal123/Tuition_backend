import express from 'express';
const router = express.Router();
import { getAnnouncements, createAnnouncement } from '../controllers/announcement.controller.js';
import { protect } from '../middleware/auth.middleware.js';

router.use(protect);

router.route('/')
  .get(getAnnouncements)
  .post(createAnnouncement);

export default router;
