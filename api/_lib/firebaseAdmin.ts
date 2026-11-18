import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

/** Safe-to-show configuration problem (names variables, never values). */
export class ConfigError extends Error {}

/** Trim and strip quotes / trailing commas left over from copying out of JSON. */
function clean(value: string | undefined): string {
  let v = (value ?? '').trim().replace(/,$/, '').trim();
  if (v.length > 1 && ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

function privateKey(): string {
  const text = clean(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\n');
  // Keep only the PEM block so any stray characters around it are ignored.
  const match = text.match(/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/);
  return match ? match[0] : text;
}

function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = clean(process.env.FIREBASE_PROJECT_ID);
  const clientEmail = clean(process.env.FIREBASE_CLIENT_EMAIL);
  const key = privateKey();

  const missing = [
    !projectId && 'FIREBASE_PROJECT_ID',
    !clientEmail && 'FIREBASE_CLIENT_EMAIL',
    !key && 'FIREBASE_PRIVATE_KEY',
  ].filter(Boolean);
  if (missing.length) {
    throw new ConfigError(`missing ${missing.join(', ')}`);
  }

  try {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey: key }),
    });
  } catch (err) {
    console.error('[firebaseAdmin] cert() failed:', err instanceof Error ? err.message : err);
    throw new ConfigError('FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL is not a valid service account value');
  }
}

export function adminAuth() {
  return getAuth(getAdminApp());
}

export function adminDb() {
  return getFirestore(getAdminApp());
}
