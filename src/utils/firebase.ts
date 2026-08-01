import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';

// Path to the service account key JSON file
const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    const serviceAccount = require(serviceAccountPath);
    
    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: "https://anushabazaar-2288e-default-rtdb.firebaseio.com"
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
}

export const auth = getAuth();
export const db = getFirestore(); // If you use Firestore
