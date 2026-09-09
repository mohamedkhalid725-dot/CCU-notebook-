import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { PatientRecord, FieldVisibilityConfig } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore (with databaseId if custom database is provided)
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();

// Authentication Helpers
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return cred.user;
}

export async function registerWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (displayName && cred.user) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

export async function loginWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Cloud Patient Storage Functions
const getPatientsCollection = (userId: string) => {
  return collection(db, 'users', userId, 'patients');
};

export async function fetchCloudPatients(userId: string): Promise<PatientRecord[]> {
  try {
    const colRef = getPatientsCollection(userId);
    const snap = await getDocs(colRef);
    const results: PatientRecord[] = [];
    snap.forEach(docSnap => {
      results.push(docSnap.data() as PatientRecord);
    });
    return results;
  } catch (error) {
    console.error('Error fetching cloud patients:', error);
    throw error;
  }
}

export async function savePatientToCloud(userId: string, patient: PatientRecord): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'patients', patient.id);
    await setDoc(docRef, {
      ...patient,
      lastSyncedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error(`Error saving patient ${patient.id} to cloud:`, error);
    throw error;
  }
}

export async function deletePatientFromCloud(userId: string, patientId: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'patients', patientId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting patient ${patientId} from cloud:`, error);
    throw error;
  }
}

export async function syncAllPatientsToCloud(userId: string, patients: PatientRecord[]): Promise<void> {
  try {
    if (!patients.length) return;
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    patients.forEach(pt => {
      const docRef = doc(db, 'users', userId, 'patients', pt.id);
      batch.set(docRef, { ...pt, lastSyncedAt: now }, { merge: true });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error batch syncing patients to cloud:', error);
    throw error;
  }
}

export function subscribeToCloudPatients(
  userId: string, 
  onSuccess: (patients: PatientRecord[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = getPatientsCollection(userId);
  return onSnapshot(
    colRef, 
    (snapshot) => {
      const list: PatientRecord[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as PatientRecord);
      });
      onSuccess(list);
    },
    (err) => {
      console.warn('Firestore snapshot listener error:', err);
      if (onError) onError(err);
    }
  );
}

// User Clinical Preferences Sync
export async function saveUserSettingsToCloud(
  userId: string,
  settings: {
    totalBeds?: number;
    specialtyMode?: string;
    fieldConfig?: FieldVisibilityConfig;
  }
): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'settings', 'clinicalConfig');
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error saving user settings to cloud:', err);
  }
}

export async function fetchUserSettingsFromCloud(userId: string) {
  try {
    const colRef = collection(db, 'users', userId, 'settings');
    const snap = await getDocs(colRef);
    let config: any = null;
    snap.forEach(d => {
      if (d.id === 'clinicalConfig') {
        config = d.data();
      }
    });
    return config;
  } catch (err) {
    console.warn('Could not fetch cloud settings:', err);
    return null;
  }
}
