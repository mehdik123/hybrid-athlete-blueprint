import { FormEvent, useEffect, useState } from 'react';
import { Copy, Loader2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  disableAdminCode,
  fetchAdminCodes,
  generateAdminCode,
  type AdminCodeRow,
} from '../lib/accessApi';
import { Button, Eyebrow, Field, Input } from './ui';

function formatWhen(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString();
}

export default function AdminCodesPage() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [note, setNote] = useState('');
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);
  const [codes, setCodes] = useState<AdminCodeRow[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  const load = async () => {
    setLoadingList(true);
    setError('');
    try {
      setCodes(await fetchAdminCodes());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load codes.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login/returning');
      return;
    }
    void load();
  }, [loading, user?.id]);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setCopied(false);
    setBusy(true);
    try {
      const code = await generateAdminCode(note);
      setGenerated(code);
      setNote('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate a code.');
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setCopied(true);
  };

  const handleDisable = async (code: string) => {
    if (!window.confirm(`Disable ${code}?`)) return;
    setBusy(true);
    setError('');
    try {
      await disableAdminCode(code);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not disable code.');
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-dvh bg-app px-6 py-12 text-txt-mid">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-app text-txt-hi">
      <div className="mx-auto max-w-2xl px-5 pb-16 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Eyebrow>Admin</Eyebrow>
            <h1 className="mt-3 font-display text-4xl font-semibold uppercase tracking-tight">
              Access codes
            </h1>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-txt-lo hover:text-txt-hi"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>

        <form onSubmit={handleGenerate} className="mt-8 space-y-4 rounded-[18px] bg-surface-1 p-5">
          <Field label="Note (Instagram username)" htmlFor="code-note">
            <Input
              id="code-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="@buyer"
            />
          </Field>
          <Button type="submit" variant="primary" disabled={busy || !note.trim()}>
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating
              </span>
            ) : (
              'Generate code'
            )}
          </Button>

          {generated && (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-3">
              <p className="font-display text-2xl tracking-[0.18em]">{generated}</p>
              <Button type="button" variant="secondary" size="sm" onClick={() => void handleCopy()}>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          )}
        </form>

        {error && <p className="mt-4 text-sm text-brand">{error}</p>}

        <h2 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.14em] text-txt-lo">
          All codes
        </h2>

        {loadingList ? (
          <p className="mt-4 text-sm text-txt-mid">Loading codes…</p>
        ) : codes.length === 0 ? (
          <p className="mt-4 text-sm text-txt-mid">No codes yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {codes.map((row) => (
              <li
                key={row.code}
                className="rounded-[14px] bg-surface-1 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl tracking-[0.12em]">{row.code}</p>
                    <p className="mt-1 text-sm text-txt-mid">{row.note || '—'}</p>
                    <p className="mt-1 text-[13px] text-txt-lo">
                      {row.status === 'used'
                        ? `Used by ${row.usedByEmail ?? 'unknown'}${row.usedAt ? ` · ${formatWhen(row.usedAt)}` : ''}`
                        : row.status === 'disabled'
                          ? 'Disabled'
                          : 'Unused'}
                    </p>
                  </div>
                  {row.status === 'unused' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => void handleDisable(row.code)}
                    >
                      Disable
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
