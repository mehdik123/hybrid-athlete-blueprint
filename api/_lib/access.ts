import { randomInt } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from './firebaseAdmin.js';

export const GRANDFATHER_BEFORE = new Date('2026-11-17T00:00:00.000Z');
export const ALREADY_USED =
  'This code has already been used. DM me on Instagram if this is a mistake.';

export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function userRef(uid: string) {
  return adminDb().doc(`users/${uid}`);
}

export async function grantAccess(uid: string, extra: Record<string, unknown> = {}) {
  await userRef(uid).set(
    {
      hasAccess: true,
      grantedAt: FieldValue.serverTimestamp(),
      ...extra,
    },
    { merge: true }
  );
}

export async function hasAccessFlag(uid: string): Promise<boolean> {
  const snap = await userRef(uid).get();
  return snap.exists && snap.data()?.hasAccess === true;
}

/** Existing accounts created before 2026-11-17 keep access. */
export async function ensureGrandfathered(uid: string, email: string | null): Promise<boolean> {
  if (await hasAccessFlag(uid)) return true;

  const record = await adminAuth().getUser(uid);
  const created = record.metadata.creationTime
    ? new Date(record.metadata.creationTime)
    : null;

  if (created && created < GRANDFATHER_BEFORE) {
    await grantAccess(uid, {
      email: email ?? record.email ?? null,
      grandfathered: true,
    });
    return true;
  }

  return false;
}

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function randomManualCode(length = 8): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHABET[randomInt(ALPHABET.length)];
  }
  return out;
}

type GumroadVerify = {
  success?: boolean;
  purchase?: {
    refunded?: boolean;
    chargebacked?: boolean;
    disputed?: boolean;
  };
};

export async function verifyGumroadLicense(licenseKey: string): Promise<boolean> {
  const productId = process.env.GUMROAD_PRODUCT_ID;
  if (!productId) return false;

  // URLSearchParams form-encodes the trailing "==" in the product id correctly.
  const body = new URLSearchParams({
    product_id: productId,
    license_key: licenseKey,
    increment_uses_count: 'false',
  });

  const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) return false;

  const data = (await response.json()) as GumroadVerify;
  const purchase = data.purchase;
  return (
    data.success === true &&
    purchase?.refunded !== true &&
    purchase?.chargebacked !== true &&
    purchase?.disputed !== true
  );
}
