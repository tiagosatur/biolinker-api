import * as admin from 'firebase-admin';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from '../../config/env';

// Admin SDK initialization (for backend)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: firebaseConfig.projectId,
      privateKey: firebaseConfig.privateKey?.replace(/\\n/g, '\n'),
      clientEmail: firebaseConfig.clientEmail,
    }),
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    storageBucket: firebaseConfig.storageBucket,
  });

  // Configure Firestore
  admin.firestore().settings({
    ignoreUndefinedProperties: true
  });
}

// Export admin instances
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();

// Client SDK initialization (for frontend if needed)
const clientConfig = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  MESSAGING_SENDER_ID: firebaseConfig.MESSAGING_SENDER_ID,
  APP_ID: firebaseConfig.APP_ID,
  MEASUREMENT_ID: firebaseConfig.MEASUREMENT_ID,
};

// Initialize client SDK only if no apps exist
if (!getApps().length) {
  initializeApp(clientConfig);
}

// Export client instances
export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage(); 