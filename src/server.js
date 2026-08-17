const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const batchRoutes = require('./routes/batch.routes');
const announcementRoutes = require('./routes/announcement.routes');
const classRoutes = require('./routes/class.routes');
const activityRoutes = require('./routes/activity.routes');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/activities', activityRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Tutionly Backend API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
