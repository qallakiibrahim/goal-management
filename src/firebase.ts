/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize immediately at module load to ensure correct component registration order
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let db: any;
try {
  db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
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
