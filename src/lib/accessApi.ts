import { auth } from './firebase';

async function authHeader(): Promise<HeadersInit> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Sign in required.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    if (body.error) return body.error;
  } catch {
    /* ignore */
  }
  return 'Something went wrong. Try again.';
}

export async function fetchAccessStatus(): Promise<boolean> {
  const headers = await authHeader();
  const res = await fetch('/api/access-status', { method: 'GET', headers });
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { hasAccess?: boolean };
  return body.hasAccess === true;
}

export async function redeemAccessCode(code: string): Promise<void> {
  const headers = await authHeader();
  const res = await fetch('/api/redeem-code', {
    method: 'POST',
    headers,
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export type AdminCodeRow = {
  code: string;
  note: string;
  disabled: boolean;
  createdAt: string | null;
  status: 'unused' | 'used' | 'disabled';
  usedByEmail: string | null;
  usedAt: string | null;
};

export async function fetchAdminCodes(): Promise<AdminCodeRow[]> {
  const headers = await authHeader();
  const res = await fetch('/api/admin/codes', { method: 'GET', headers });
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { codes?: AdminCodeRow[] };
  return body.codes ?? [];
}

export async function generateAdminCode(note: string): Promise<string> {
  const headers = await authHeader();
  const res = await fetch('/api/admin/codes', {
    method: 'POST',
    headers,
    body: JSON.stringify({ note }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { code?: string };
  if (!body.code) throw new Error('No code returned.');
  return body.code;
}

export async function disableAdminCode(code: string): Promise<void> {
  const headers = await authHeader();
  const res = await fetch('/api/admin/disable-code', {
    method: 'POST',
    headers,
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}
