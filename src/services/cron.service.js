import cron from 'node-cron';
import Student from '../models/Student.model.js';
import Class from '../models/Class.model.js';
import Notification from '../models/Notification.model.js';
import { sendPushNotification } from './firebase.service.js';

export const initializeCronJobs = () => {
  // Schedule a daily job at 10:00 AM (Fee Reminders)
  cron.schedule('0 10 * * *', async () => {
    console.log('Running daily overdue fee reminder check at 10:00 AM...');
    try {
      const students = await Student.find({ status: 'Active', feeStatus: 'Pending' })
        .populate('tutorId', 'tuitionName name');
      
      if (students.length === 0) return;

      for (const student of students) {
        const tuitionName = student.tutorId?.tuitionName || student.tutorId?.name || 'your tuition';
        const bodyMessage = `Your tuition fees for ${tuitionName} are currently pending. Please ensure payment is made at your earliest convenience.`;

        if (student.fcmTokens && student.fcmTokens.length > 0) {
          await sendPushNotification({
            tokens: student.fcmTokens,
            title: 'Fee Payment Reminder',
            body: bodyMessage,
            data: { type: 'fee_reminder' }
          });
        }

        await Notification.create({
          recipientId: student._id,
          recipientModel: 'Student',
          title: 'Fee Payment Reminder',
          body: bodyMessage,
          type: 'fee'
        });
      }
    } catch (error) {
      console.error('Error running overdue fee reminder cron job:', error);
    }
  });

  // Schedule a monthly job at midnight (00:00) on the 1st day of every month (Fee Reset)
  cron.schedule('0 0 1 * *', async () => {
    console.log('Running monthly fee status reset...');
    try {
      await Student.updateMany(
        { status: 'Active' },
        { $set: { feeStatus: 'Pending' } }
      );
    } catch (error) {
      console.error('Error running monthly fee status reset cron job:', error);
    }
  });

  // Daily Morning Summary at 6:00 AM
  cron.schedule('0 6 * * *', async () => {
    console.log('Running daily 6:00 AM class schedule summary...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Find all upcoming classes for today
      const classes = await Class.find({
        date: { $gte: today, $lt: endOfDay },
        status: 'Upcoming'
      }).populate('tutorId').populate('batchId');

      // Group classes by tutor
      const tutorClasses = {};
      classes.forEach(cls => {
        if (!cls.tutorId) return;
        const tutorIdStr = cls.tutorId._id.toString();
        if (!tutorClasses[tutorIdStr]) {
          tutorClasses[tutorIdStr] = { tutor: cls.tutorId, classes: [] };
        }
        tutorClasses[tutorIdStr].classes.push(cls);
      });

      for (const tutorData of Object.values(tutorClasses)) {
        const { tutor, classes } = tutorData;
        const totalClasses = classes.length;
        
        // Find the earliest class time
        let earliestTimeStr = classes[0].time;
        // Basic sort if needed, assuming time string is HH:MM or similar. We just use the first for simplicity if not sorted.
        classes.sort((a, b) => a.time.localeCompare(b.time));
        
        const firstClass = classes[0];
        
        const title = 'Your Schedule Today';
        const bodyMessage = `Good morning! You have ${totalClasses} class${totalClasses > 1 ? 'es' : ''} scheduled for today. Your first class starts at ${firstClass.time}.`;

        if (tutor.fcmTokens && tutor.fcmTokens.length > 0) {
          await sendPushNotification({
            tokens: tutor.fcmTokens,
            title,
            body: bodyMessage,
            data: { type: 'schedule_summary' }
          });
        }
      }
    } catch (error) {
      console.error('Error running 6AM schedule summary job:', error);
    }
  });

  // Upcoming Class Reminder (Runs every 15 minutes)
  cron.schedule('*/15 * * * *', async () => {
    console.log('Checking for upcoming classes in 1 hour...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const classes = await Class.find({
        date: { $gte: today, $lt: endOfDay },
        status: 'Upcoming'
      }).populate('tutorId').populate('batchId');

      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeInMinutes = currentHours * 60 + currentMinutes;

      for (const cls of classes) {
        if (!cls.time || !cls.tutorId) continue;
        
        // Parse time (e.g., '14:30' or '02:30 PM')
        let hours = 0;
        let minutes = 0;
        const timeParts = cls.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (timeParts) {
          hours = parseInt(timeParts[1], 10);
          minutes = parseInt(timeParts[2], 10);
          const ampm = timeParts[3]?.toUpperCase();
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }

        const classTimeInMinutes = hours * 60 + minutes;
        const timeDiff = classTimeInMinutes - currentTimeInMinutes;

        // If class starts between 45 to 60 minutes from now
        // Because the cron runs every 15 mins (e.g. at :00, :15, :30, :45)
        // This ensures the notification hits exactly once in the 1 hour window prior
        if (timeDiff > 45 && timeDiff <= 60) {
          const tutor = cls.tutorId;
          const batchName = cls.batchId ? cls.batchId.name : 'Unknown Batch';
          const title = 'Upcoming Class Reminder';
          const bodyMessage = `Reminder: Your class for ${batchName} starts in 1 hour (at ${cls.time}).`;

          if (tutor.fcmTokens && tutor.fcmTokens.length > 0) {
            await sendPushNotification({
              tokens: tutor.fcmTokens,
              title,
              body: bodyMessage,
              data: { type: 'class_reminder', classId: cls._id.toString() }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error running upcoming class reminder job:', error);
    }
  });

  console.log('Cron jobs initialized successfully.');
};
