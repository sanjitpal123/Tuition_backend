import express from 'express';
import { saveToken, getNotifications, markAsRead } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Currently using Tutor protect middleware. 
// If students log in, you will need a separate middleware for them.
router.post('/token', protect, saveToken);
router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);

export default router;
