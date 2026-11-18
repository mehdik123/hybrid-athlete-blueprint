import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import { json, readBody, requireAdmin } from '../_lib/auth.js';
import { adminDb } from '../_lib/firebaseAdmin.js';
import { normalizeCode } from '../_lib/access.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed.' });
    return;
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const payload = readBody(req);
  const code = normalizeCode(typeof payload.code === 'string' ? payload.code : '');
  if (!code) {
    json(res, 400, { error: 'Missing code.' });
    return;
  }

  try {
    const ref = adminDb().doc(`access_codes/${code}`);
    const snap = await ref.get();
    if (!snap.exists) {
      json(res, 404, { error: 'Code not found.' });
      return;
    }
    await ref.update({ disabled: true, disabledAt: FieldValue.serverTimestamp() });
    json(res, 200, { ok: true });
  } catch (err) {
    console.error('[admin/disable-code]', err);
    json(res, 500, { error: 'Could not disable code.' });
  }
}
