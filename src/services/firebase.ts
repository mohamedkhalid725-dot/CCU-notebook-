import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithCredential,
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

import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

import firebaseConfig from '../../firebase-applet-config.json';
import { PatientRecord, FieldVisibilityConfig } from '../types';

// Initialize Firebase App
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db =
  firebaseConfig.firestoreDatabaseId &&
  firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Authentication Helpers

export async function loginWithEmail(
  email: string,
  pass: string
): Promise<User> {
  const cred = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    pass
  );

  return cred.user;
}

export async function registerWithEmail(
  email: string,
  pass: string,
  displayName?: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    pass
  );

  if (displayName && cred.user) {
    await updateProfile(cred.user, {
      displayName
    });
  }

  return cred.user;
}

// Google Authentication
export async function loginWithGoogle(): Promise<User> {
  // Android / iOS
  if (Capacitor.isNativePlatform()) {
    const result = await FirebaseAuthentication.signInWithGoogle({ useCredentialManager: false });

    const idToken = result.credential?.idToken;

    if (!idToken) {
      throw new Error('Google Sign-In did not return an ID token.');
    }

    const credential = GoogleAuthProvider.credential(idToken);

    const firebaseCredential = await signInWithCredential(
      auth,
      credential
    );

    return firebaseCredential.user;
  }

  // Web browser
  const cred = await signInWithPopup(
    auth,
    googleProvider
  );

  return cred.user;
}

export async function loginWithGoogleRedirect(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await loginWithGoogle();
    return;
  }
  await signInWithRedirect(auth, googleProvider);
}

export async function checkRedirectAuth(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (err) {
    console.warn('Redirect auth check warning:', err);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signOut();
    }
  } catch (error) {
    console.warn('Native Firebase logout warning:', error);
  }

  await signOut(auth);
}

export function subscribeToAuth(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}

// Cloud Patient Storage

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function isPermissionDeniedError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('permission-denied') ||
    msg.includes('Missing or insufficient permissions') ||
    msg.includes('insufficient permissions')
  );
}

const getPatientsCollection = (userId: string) => {
  return collection(
    db,
    'users',
    userId,
    'patients'
  );
};

export async function fetchCloudPatients(
  userId: string
): Promise<PatientRecord[]> {
  const path = `users/${userId}/patients`;
  try {
    const colRef = getPatientsCollection(userId);
    const snap = await getDocs(colRef);

    const results: PatientRecord[] = [];

    snap.forEach((docSnap) => {
      results.push(
        docSnap.data() as PatientRecord
      );
    });

    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function savePatientToCloud(
  userId: string,
  patient: PatientRecord
): Promise<void> {
  const path = `users/${userId}/patients/${patient.id}`;
  try {
    const docRef = doc(
      db,
      'users',
      userId,
      'patients',
      patient.id
    );

    await setDoc(
      docRef,
      {
        ...patient,
        lastSyncedAt:
          new Date().toISOString()
      },
      {
        merge: true
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePatientFromCloud(
  userId: string,
  patientId: string
): Promise<void> {
  const path = `users/${userId}/patients/${patientId}`;
  try {
    const docRef = doc(
      db,
      'users',
      userId,
      'patients',
      patientId
    );

    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncAllPatientsToCloud(
  userId: string,
  patients: PatientRecord[]
): Promise<void> {
  const path = `users/${userId}/patients`;
  try {
    if (!patients.length) return;

    const batch = writeBatch(db);

    const now =
      new Date().toISOString();

    patients.forEach((pt) => {
      const docRef = doc(
        db,
        'users',
        userId,
        'patients',
        pt.id
      );

      batch.set(
        docRef,
        {
          ...pt,
          lastSyncedAt: now
        },
        {
          merge: true
        }
      );
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToCloudPatients(
  userId: string,
  onSuccess: (
    patients: PatientRecord[]
  ) => void,
  onError?: (err: Error) => void
) {
  const path = `users/${userId}/patients`;
  const colRef =
    getPatientsCollection(userId);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: PatientRecord[] = [];

      snapshot.forEach((docSnap) => {
        list.push(
          docSnap.data() as PatientRecord
        );
      });

      onSuccess(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (formattedErr) {
        if (onError) {
          onError(formattedErr as Error);
        }
      }
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
  const path = `users/${userId}/settings/clinicalConfig`;
  try {
    const docRef = doc(
      db,
      'users',
      userId,
      'settings',
      'clinicalConfig'
    );

    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt:
          new Date().toISOString()
      },
      {
        merge: true
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchUserSettingsFromCloud(
  userId: string
) {
  const path = `users/${userId}/settings`;
  try {
    const colRef = collection(
      db,
      'users',
      userId,
      'settings'
    );

    const snap =
      await getDocs(colRef);

    let config: any = null;

    snap.forEach((d) => {
      if (d.id === 'clinicalConfig') {
        config = d.data();
      }
    });

    return config;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, path);
    } catch {
      return null;
    }
  }
}
