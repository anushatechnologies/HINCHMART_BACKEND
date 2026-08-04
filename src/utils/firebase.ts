import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';

// Path to the service account key JSON file
const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

// Initialize Firebase Admin SDK
let isInitialized = false;
if (!getApps().length) {
  try {
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      
      // Basic validation to prevent crashing on empty JSON objects from bad echoing
      if (serviceAccount.project_id) {
        initializeApp({
          credential: cert(serviceAccount),
          databaseURL: "https://anushabazaar-2288e-default-rtdb.firebaseio.com"
        });
        console.log('Firebase Admin SDK initialized successfully');
        isInitialized = true;
      } else {
        console.warn('Firebase serviceAccountKey.json is invalid (missing project_id).');
      }
    } else {
      console.warn('Firebase serviceAccountKey.json not found. Firebase Admin SDK not initialized.');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
} else {
  isInitialized = true;
}

export const auth = isInitialized ? getAuth() : null as any;
export const db = isInitialized ? getFirestore() : null as any;
