import express from 'express';
const router = express.Router();
import { registerTutor, loginTutor, resetPassword } from '../controllers/auth.controller.js';

router.post('/register', registerTutor);
router.post('/login', loginTutor);
router.post('/reset-password', resetPassword);

export default router;
