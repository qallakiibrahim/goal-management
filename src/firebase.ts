/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAGVxAfzKe3GVpRLgjkuCI1FG-FjtHx_lY",
  authDomain: "vivid-kayak-nrr5c.firebaseapp.com",
  projectId: "vivid-kayak-nrr5c",
  storageBucket: "vivid-kayak-nrr5c.firebasestorage.app",
  messagingSenderId: "1017903634535",
  appId: "1:1017903634535:web:844f78d107a3eebc815cc2"
};

let app: any = null;
let db: any = null;

export function getFirebaseApp() {
  if (!app) {
    if (getApps().length > 0) {
      app = getApp();
    } else {
      app = initializeApp(firebaseConfig);
    }
  }
  return app;
}

export function getFirebaseDb() {
  if (!db) {
    const initializedApp = getFirebaseApp();
    try {
      // In Firebase JS SDK v9+, if we have a custom database id, we specify it as third parameter to initializeFirestore
      db = initializeFirestore(initializedApp, {}, "ai-studio-d429fa02-f5da-4544-80db-f079a04e5104");
    } catch (e) {
      // If already initialized, getFirestore will resolve standard or custom databaseId
      db = getFirestore(initializedApp, "ai-studio-d429fa02-f5da-4544-80db-f079a04e5104");
    }
  }
  return db;
}
