import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import { json, readBody, requireUser } from './_lib/auth.js';
import { adminDb } from './_lib/firebaseAdmin.js';
import {
  ALREADY_USED,
  hasAccessFlag,
  normalizeCode,
  verifyGumroadLicense,
} from './_lib/access.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed.' });
    return;
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const payload = readBody(req);
  const raw = typeof payload.code === 'string' ? payload.code : '';
  const code = normalizeCode(raw);
  if (!code) {
    json(res, 400, { error: 'Enter your access code.' });
    return;
  }

  try {
    if (await hasAccessFlag(user.uid)) {
      json(res, 200, { hasAccess: true });
      return;
    }

    const db = adminDb();
    const redeemedRef = db.doc(`redeemed_codes/${code}`);
    const manualRef = db.doc(`access_codes/${code}`);

    const source = await (async (): Promise<'manual' | 'gumroad' | null> => {
      const manual = await manualRef.get();
      if (manual.exists) {
        if (manual.data()?.disabled === true) return null;
        return 'manual';
      }
      if (await verifyGumroadLicense(raw.trim())) return 'gumroad';
      return null;
    })();

    if (!source) {
      json(res, 400, { error: 'This code is not valid.' });
      return;
    }

    try {
      await db.runTransaction(async (tx) => {
        const already = await tx.get(redeemedRef);
        if (already.exists) {
          const owner = already.data()?.uid as string | undefined;
          if (owner && owner !== user.uid) {
            throw new Error('ALREADY_USED');
          }
        } else {
          tx.set(redeemedRef, {
            uid: user.uid,
            email: user.email,
            source,
            redeemedAt: FieldValue.serverTimestamp(),
          });
        }
        tx.set(
          db.doc(`users/${user.uid}`),
          {
            hasAccess: true,
            email: user.email,
            grantedAt: FieldValue.serverTimestamp(),
            source,
          },
          { merge: true }
        );
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'ALREADY_USED') {
        json(res, 409, { error: ALREADY_USED });
        return;
      }
      throw err;
    }

    json(res, 200, { hasAccess: true });
  } catch (err) {
    console.error('[redeem-code]', err);
    json(res, 500, { error: 'Could not redeem this code.' });
  }
}
