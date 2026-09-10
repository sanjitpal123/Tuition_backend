import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
dotenv.config()
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
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
import { initializeFirebase } from './services/firebase.service.js';
import { initializeCronJobs } from './services/cron.service.js';

initializeFirebase();
initializeCronJobs();

import homeworkRoutes from './routes/homework.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from uploads folder (in the parent directory of src)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Setupclass Backend API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
