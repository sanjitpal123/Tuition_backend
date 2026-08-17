import express from 'express';
const router = express.Router();
import { registerTutor, loginTutor, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

router.post('/register', registerTutor);
router.post('/login', loginTutor);
router.get('/me', protect, getMe);

export default router;
