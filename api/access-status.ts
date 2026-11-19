import type { VercelRequest, VercelResponse } from '@vercel/node';
import { json, requireUser } from './_lib/auth.js';
import { ensureGrandfathered } from './_lib/access.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed.' });
    return;
  }

  const user = await requireUser(req, res);
  if (!user) return;

  try {
    const adminUid = process.env.ADMIN_UID;
    const isAdmin = Boolean(adminUid) && user.uid === adminUid;
    // The owner never sees the code screen.
    const hasAccess = isAdmin || (await ensureGrandfathered(user.uid, user.email));
    json(res, 200, { hasAccess, isAdmin });
  } catch (err) {
    console.error('[access-status]', err);
    json(res, 500, { error: 'Could not check access.' });
  }
}
