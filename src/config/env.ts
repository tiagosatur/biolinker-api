import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Server Configuration
export const serverConfig = {
  port: process.env.PORT || '3001'
} as const;

// Firebase Configuration
export const firebaseConfig = {
  // Required Admin SDK Configuration
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  
  // Required Client SDK Configuration
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  
  // Optional Client SDK Configuration
  MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  APP_ID: process.env.FIREBASE_APP_ID,
  MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
} as const;

// Simple validation of required fields
const requiredFields = ['projectId', 'privateKey', 'clientEmail', 'apiKey', 'authDomain', 'storageBucket'];
requiredFields.forEach((key) => {
  if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
    throw new Error(`Missing required environment variable for Firebase: ${key}`);
  }
}); 