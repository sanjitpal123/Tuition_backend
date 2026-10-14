import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import connectDB from './config/db.js';

connectDB();

const app = express();

// 1. Tell Express it is behind Render's reverse proxy
app.set('trust proxy', 1);

// 2. HTTP Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 3. CORS
app.use(cors());
app.use(express.json());

// 4. Rate Limiters
// General API Limiter (Generous: 600 reqs / 15 min for normal dashboard browsing)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' }
});
app.use('/api', generalLimiter);

// Strict Auth Limiter (Strict: 25 attempts / 15 min to stop password brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' }
});

// Import services and routes
import { initializeFirebase } from './services/firebase.service.js';
import { initializeCronJobs } from './services/cron.service.js';
initializeFirebase();
initializeCronJobs();

import authRoutes from './routes/auth.routes.js';
import studentAuthRoutes from './routes/studentAuth.routes.js';
import studentRoutes from './routes/student.routes.js';
import batchRoutes from './routes/batch.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import classRoutes from './routes/class.routes.js';
import activityRoutes from './routes/activity.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import feeRoutes from './routes/fee.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import homeworkRoutes from './routes/homework.routes.js';

// Apply strict limiter ONLY to sensitive auth endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/student-auth/login', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student-auth', studentAuthRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/homework', homeworkRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Setupclass Backend API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});