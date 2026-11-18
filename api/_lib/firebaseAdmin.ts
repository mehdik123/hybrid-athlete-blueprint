import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function privateKey(): string {
  const raw = process.env.FIREBASE_PRIVATE_KEY ?? '';
  return raw.replace(/\\n/g, '\n');
}

function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const key = privateKey();

  if (!projectId || !clientEmail || !key) {
    throw new Error('Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY');
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: key,
    }),
  });
}

export function adminAuth() {
  return getAuth(getAdminApp());
}

export function adminDb() {
  return getFirestore(getAdminApp());
}
