import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from './firebaseAdmin.js';

export function json(res: VercelResponse, status: number, body: unknown) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(body));
}

export function readBody(req: VercelRequest): Record<string, unknown> {
  const raw = req.body;
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object') return raw as Record<string, unknown>;
  return {};
}

export async function requireUser(
  req: VercelRequest,
  res: VercelResponse
): Promise<{ uid: string; email: string | null; token: DecodedIdToken } | null> {
  const header = req.headers.authorization ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    json(res, 401, { error: 'Sign in required.' });
    return null;
  }
  try {
    const token = await adminAuth().verifyIdToken(match[1]);
    return { uid: token.uid, email: token.email ?? null, token };
  } catch {
    json(res, 401, { error: 'Sign in required.' });
    return null;
  }
}

export async function requireAdmin(req: VercelRequest, res: VercelResponse) {
  const user = await requireUser(req, res);
  if (!user) return null;
  const adminUid = process.env.ADMIN_UID;
  if (!adminUid || user.uid !== adminUid) {
    json(res, 403, { error: 'Not allowed.' });
    return null;
  }
  return user;
}
