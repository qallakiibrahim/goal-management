/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAGVxAfzKe3GVpRLgjkuCI1FG-FjtHx_lY",
  authDomain: "vivid-kayak-nrr5c.firebaseapp.com",
  projectId: "vivid-kayak-nrr5c",
  storageBucket: "vivid-kayak-nrr5c.firebasestorage.app",
  messagingSenderId: "1017903634535",
  appId: "1:1017903634535:web:844f78d107a3eebc815cc2"
};

// Initialize immediately at module load to ensure correct component registration order
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let db: any;
try {
  db = initializeFirestore(app, {}, "ai-studio-d429fa02-f5da-4544-80db-f079a04e5104");
} catch (e) {
  db = getFirestore(app, "ai-studio-d429fa02-f5da-4544-80db-f079a04e5104");
}

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
