/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDocs, 
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { Goal, Objective, Project, Initiative, Task, KPI, KataSession, UserProfile } from './types';
import { 
  DEFAULT_GOALS, 
  DEFAULT_OBJECTIVES, 
  DEFAULT_PROJECTS, 
  DEFAULT_INITIATIVES, 
  DEFAULT_TASKS, 
  DEFAULT_KPIS, 
  DEFAULT_KATA_SESSIONS, 
  DEFAULT_USER_PROFILE 
} from './demoData';

const db = getFirebaseDb();

// Seed specific collection if it is empty
async function seedCollectionIfEmpty(collectionName: string, defaultData: any[]) {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  if (snapshot.empty) {
    const batch = writeBatch(db);
    defaultData.forEach((item) => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, item);
    });
    await batch.commit();
    console.log(`[Firestore] Seeded empty collection '${collectionName}' with defaults.`);
  }
}

// Global boostraper for Cloud DB
export async function bootstrapFirestore() {
  try {
    await seedCollectionIfEmpty('goals', DEFAULT_GOALS);
    await seedCollectionIfEmpty('objectives', DEFAULT_OBJECTIVES);
    await seedCollectionIfEmpty('projects', DEFAULT_PROJECTS);
    await seedCollectionIfEmpty('initiatives', DEFAULT_INITIATIVES);
    await seedCollectionIfEmpty('tasks', DEFAULT_TASKS);
    await seedCollectionIfEmpty('kpis', DEFAULT_KPIS);
    await seedCollectionIfEmpty('kataSessions', DEFAULT_KATA_SESSIONS);

    const profileRef = doc(db, 'userProfile', 'current');
    const profileDoc = await getDoc(profileRef);
    if (!profileDoc.exists()) {
      await setDoc(profileRef, DEFAULT_USER_PROFILE);
      console.log('[Firestore] Seeded empty userProfile.');
    }
  } catch (error) {
    console.error('[Firestore] Bootstrap error (skipping to local state):', error);
    throw error;
  }
}

// Atomic matching sincronizers
export async function syncGoalsToFirestore(items: Goal[]) {
  try {
    const colRef = collection(db, 'goals');
    const snapshot = await getDocs(colRef);
    const existingIds = snapshot.docs.map(d => d.id);
    const newIds = items.map(i => i.id);

    const batch = writeBatch(db);
    items.forEach(item => {
      const docRef = doc(db, 'goals', item.id);
      batch.set(docRef, item);
    });
    existingIds.forEach(id => {
      if (!newIds.includes(id)) {
        batch.delete(doc(db, 'goals', id));
      }
    });
    await batch.commit();
  } catch (err) {
    console.error('[Firestore] Goal Sync failure:', err);
  }
}

export async function syncObjectivesToFirestore(items: Objective[]) {
  try {
    const colRef = collection(db, 'objectives');
    const snapshot = await getDocs(colRef);
    const existingIds = snapshot.docs.map(d => d.id);
    const newIds = items.map(i => i.id);

    const batch = writeBatch(db);
    items.forEach(item => {
      const docRef = doc(db, 'objectives', item.id);
      batch.set(docRef, item);
    });
    existingIds.forEach(id => {
      if (!newIds.includes(id)) {
        batch.delete(doc(db, 'objectives', id));
      }
    });
    await batch.commit();
  } catch (err) {
    console.error('[Firestore] Objective Sync failure:', err);
  }
}

export async function syncProjectsToFirestore(items: Project[]) {
  try {
    const colRef = collection(db, 'projects');
    const snapshot = await getDocs(colRef);
    const existingIds = snapshot.docs.map(d => d.id);
    const newIds = items.map(i => i.id);

    const batch = writeBatch(db);
    items.forEach(item => {
      const docRef = doc(db, 'projects', item.id);
      batch.set(docRef, item);
    });
    existingIds.forEach(id => {
      if (!newIds.includes(id)) {
        batch.delete(doc(db, 'projects', id));
      }
    });
    await batch.commit();
  } catch (err) {
    console.error('[Firestore] Project Sync failure:', err);
  }
}

export async function syncInitiativesToFirestore(items: Initiative[]) {
  try {
    const colRef = collection(db, 'initiatives');
    const snapshot = await getDocs(colRef);
    const existingIds = snapshot.docs.map(d => d.id);
    const newIds = items.map(i => i.id);

    const batch = writeBatch(db);
    items.forEach(item => {
      const docRef = doc(db, 'initiatives', item.id);
      batch.set(docRef, item);
    });
    existingIds.forEach(id => {
      if (!newIds.includes(id)) {
        batch.delete(doc(db, 'initiatives', id));
      }
    });
    await batch.commit();
  } catch (err) {
    console.error('[Firestore] Initiative Sync failure:', err);
  }
}

export async function syncTasksToFirestore(items: Task[]) {
  try {
    const colRef = collection(db, 'tasks');
    const snapshot = await getDocs(colRef);
    const existingIds = snapshot.docs.map(d => d.id);
    const newIds = items.map(i => i.id);

    const batch = writeBatch(db);
    items.forEach(item => {
      const docRef = doc(db, 'tasks', item.id);
      batch.set(docRef, item);
    });
    existingIds.forEach(id => {
      if (!newIds.includes(id)) {
        batch.delete(doc(db, 'tasks', id));
      }
    });
    await batch.commit();
  } catch (err) {
    console.error('[Firestore] Task Sync failure:', err);
  }
}

export async function syncKpisToFirestore(items: KPI[]) {
  try {
    const colRef = collection(db, 'kpis');
    const snapshot = await getDocs(colRef);
    const existingIds = snapshot.docs.map(d => d.id);
    const newIds = items.map(i => i.id);

    const batch = writeBatch(db);
    items.forEach(item => {
      const docRef = doc(db, 'kpis', item.id);
      batch.set(docRef, item);
    });
    existingIds.forEach(id => {
      if (!newIds.includes(id)) {
        batch.delete(doc(db, 'kpis', id));
      }
    });
    await batch.commit();
  } catch (err) {
    console.error('[Firestore] KPI Sync failure:', err);
  }
}

export async function syncKataSessionsToFirestore(items: KataSession[]) {
  try {
    const colRef = collection(db, 'kataSessions');
    const snapshot = await getDocs(colRef);
    const existingIds = snapshot.docs.map(d => d.id);
    const newIds = items.map(i => i.id);

    const batch = writeBatch(db);
    items.forEach(item => {
      const docRef = doc(db, 'kataSessions', item.id);
      batch.set(docRef, item);
    });
    existingIds.forEach(id => {
      if (!newIds.includes(id)) {
        batch.delete(doc(db, 'kataSessions', id));
      }
    });
    await batch.commit();
  } catch (err) {
    console.error('[Firestore] KataSession Sync failure:', err);
  }
}

export async function syncUserProfileToFirestore(item: UserProfile) {
  try {
    const profileRef = doc(db, 'userProfile', 'current');
    await setDoc(profileRef, item);
  } catch (err) {
    console.error('[Firestore] UserProfile Sync failure:', err);
  }
}

export async function syncMembersToFirestore(items: any[]) {
  try {
    const colRef = collection(db, 'members');
    const snapshot = await getDocs(colRef);
    const existingIds = snapshot.docs.map(d => d.id);
    const newIds = items.map(i => i.id);

    const batch = writeBatch(db);
    items.forEach(item => {
      const docRef = doc(db, 'members', item.id);
      batch.set(docRef, item);
    });
    existingIds.forEach(id => {
      if (!newIds.includes(id)) {
        batch.delete(doc(db, 'members', id));
      }
    });
    await batch.commit();
  } catch (err) {
    console.error('[Firestore] Members Sync failure:', err);
  }
}
