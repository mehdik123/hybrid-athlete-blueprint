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

const BEGIN = '-----BEGIN PRIVATE KEY-----';
const END = '-----END PRIVATE KEY-----';

/**
 * Rebuild a clean PEM from whatever was pasted: real newlines, literal "\n",
 * newlines collapsed to spaces, quotes, trailing commas, etc.
 */
function privateKey(): string {
  const text = clean(process.env.FIREBASE_PRIVATE_KEY);
  // Drop BEGIN/END markers if present (they may also be missing entirely),
  // then keep only the base64 body. Base64 never contains a backslash, so any
  // "\n" text is an escaped newline.
  const body = text
    .replace(/-----(BEGIN|END)[A-Z ]*-----/g, '')
    .replace(/\\+n/g, '')
    .replace(/[^A-Za-z0-9+/=]/g, '');
  if (!body) return '';
  const lines = body.match(/.{1,64}/g) ?? [];
  return `${BEGIN}\n${lines.join('\n')}\n${END}\n`;
}

/** Describes the shape of the key without revealing any of it. */
function describeKey(): string {
  const text = clean(process.env.FIREBASE_PRIVATE_KEY);
  const begin = text.includes(BEGIN) ? 'yes' : 'no';
  const end = text.includes(END) ? 'yes' : 'no';
  const body = text
    .replace(/-----(BEGIN|END)[A-Z ]*-----/g, '')
    .replace(/\\+n/g, '')
    .replace(/[^A-Za-z0-9+/=]/g, '');
  const header = body.startsWith('MIIE') ? 'standard' : 'unexpected';
  return (
    `${text.length} chars pasted, BEGIN marker ${begin}, END marker ${end}; ` +
    `base64 body ${body.length} chars (length mod 4 = ${body.length % 4}, ` +
    `header ${header}); a full key body is about 1624 chars`
  );
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
    const reason = err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200);
    console.error('[firebaseAdmin] cert() failed:', reason);
    const emailOk = clientEmail.endsWith('.iam.gserviceaccount.com') ? 'ok' : 'unexpected format';
    throw new ConfigError(
      `FIREBASE_PRIVATE_KEY is not a valid private key: ${describeKey()}; ` +
        `client email ${emailOk}; parser said: ${reason}`
    );
  }
}

export function adminAuth() {
  return getAuth(getAdminApp());
}

export function adminDb() {
  return getFirestore(getAdminApp());
}
