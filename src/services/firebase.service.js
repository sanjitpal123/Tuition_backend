import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import Notification from '../models/Notification.model.js';

let isFirebaseInitialized = false;
let messagingApp;

export const initializeFirebase = () => {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace \n with actual newlines
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      messagingApp = getMessaging(app);
      isFirebaseInitialized = true;
      console.log('Firebase Admin SDK initialized successfully.');
    } else {
      console.warn('Firebase Admin SDK not initialized. Missing environment variables.');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
};

export const sendPushNotification = async ({ tokens, title, body, data = {} }) => {
  if (!isFirebaseInitialized || !tokens || tokens.length === 0) return;

  const message = {
    notification: {
      title,
      body,
    },
    data,
    tokens,
  };

  try {
    const response = await messagingApp.sendEachForMulticast(message);
    console.log(response.successCount + ' messages were sent successfully');
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
        }
      });
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

export const createAndSendNotification = async ({ recipientId, recipientModel, tokens, title, body, type }) => {
  try {
    // 1. Store notification in database
    await Notification.create({
      recipientId,
      recipientModel,
      title,
      body,
      type
    });

    // 2. Send push notification if tokens are available
    if (tokens && tokens.length > 0) {
      await sendPushNotification({
        tokens,
        title,
        body,
        data: { type }
      });
    }
  } catch (error) {
    console.error('Error in createAndSendNotification:', error);
  }
};
