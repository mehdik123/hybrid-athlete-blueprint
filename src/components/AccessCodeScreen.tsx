import { FormEvent, useState } from 'react';
import { KeyRound, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Eyebrow, Field, Input } from './ui';

interface AccessCodeScreenProps {
  onRedeem: (code: string) => Promise<void>;
  error?: string;
  onError?: (message: string) => void;
}

export default function AccessCodeScreen({ onRedeem, error, onError }: AccessCodeScreenProps) {
  const { signOut } = useAuth();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    onError?.('');
    if (!code.trim()) {
      onError?.('Enter your access code.');
      return;
    }
    setSubmitting(true);
    try {
      await onRedeem(code.trim());
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'This code is not valid.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-dvh w-full bg-app text-txt-hi">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-txt-lo hover:text-txt-hi"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
            Log out
          </button>
        </div>

        <div className="mt-10">
          <Eyebrow>Access</Eyebrow>
          <h1 className="mt-4 font-display text-[40px] font-semibold uppercase leading-none tracking-tight text-txt-hi">
            Enter your access code
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-txt-mid">
            Card buyers: the license key in your Gumroad receipt email. Bank transfer buyers: the
            code I sent you on Instagram.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Field label="Access code" htmlFor="access-code">
            <Input
              id="access-code"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code"
              icon={<KeyRound className="h-4 w-4" />}
              invalid={Boolean(error)}
            />
          </Field>

          {error && <p className="text-sm text-brand">{error}</p>}

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={submitting} arrow>
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking
              </span>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
