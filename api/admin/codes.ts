import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import { json, readBody, requireAdmin } from '../_lib/auth.js';
import { adminDb } from '../_lib/firebaseAdmin.js';
import { randomManualCode } from '../_lib/access.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const db = adminDb();

  try {
    if (req.method === 'GET') {
      const [codesSnap, redeemedSnap] = await Promise.all([
        db.collection('access_codes').orderBy('createdAt', 'desc').get(),
        db.collection('redeemed_codes').get(),
      ]);

      const redeemed = new Map(
        redeemedSnap.docs.map((d) => [d.id, d.data() as Record<string, unknown>])
      );

      const codes = codesSnap.docs.map((d) => {
        const data = d.data();
        const used = redeemed.get(d.id);
        const redeemedAt = used?.redeemedAt as { toDate?: () => Date } | undefined;
        return {
          code: d.id,
          note: (data.note as string) ?? '',
          disabled: data.disabled === true,
          createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? null,
          status: used
            ? 'used'
            : data.disabled === true
              ? 'disabled'
              : 'unused',
          usedByEmail: (used?.email as string) ?? null,
          usedAt: redeemedAt?.toDate?.()?.toISOString() ?? null,
        };
      });

      json(res, 200, { codes });
      return;
    }

    if (req.method === 'POST') {
      const payload = readBody(req);
      const note = typeof payload.note === 'string' ? payload.note.trim() : '';
      if (!note) {
        json(res, 400, { error: 'Add a note (Instagram username).' });
        return;
      }

      let code = '';
      for (let i = 0; i < 8; i++) {
        const candidate = randomManualCode();
        const exists = await db.doc(`access_codes/${candidate}`).get();
        if (!exists.exists) {
          code = candidate;
          break;
        }
      }
      if (!code) {
        json(res, 500, { error: 'Could not generate a unique code.' });
        return;
      }

      await db.doc(`access_codes/${code}`).set({
        code,
        note,
        disabled: false,
        createdAt: FieldValue.serverTimestamp(),
      });

      json(res, 200, { code, note });
      return;
    }

    json(res, 405, { error: 'Method not allowed.' });
  } catch (err) {
    console.error('[admin/codes]', err);
    json(res, 500, { error: 'Admin request failed.' });
  }
}
