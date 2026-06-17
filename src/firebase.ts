/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyC28-5arKq19k6uK_EwGZcVRtQgER4JCVw",
  authDomain: "goal-management-33104.firebaseapp.com",
  projectId: "goal-management-33104",
  storageBucket: "goal-management-33104.firebasestorage.app",
  messagingSenderId: "212948587384",
  appId: "1:212948587384:web:472c3ee03b6d29e7092e8d",
  measurementId: "G-RW64E1TRPR"
};

// Initialize immediately at module load to ensure correct component registration order
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

export function getFirebaseApp() {
  return app;
}

export function getFirebaseDb() {
  return db;
}

export function getFirebaseAuth() {
  return auth;
}
