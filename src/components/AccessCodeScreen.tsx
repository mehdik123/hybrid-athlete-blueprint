import { FormEvent, useState } from 'react';
import { KeyRound, Loader2, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Button, Eyebrow, Field, Input } from './ui';
import { itemVariants, listVariants, spring } from '../design/motion';

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
    <div className="relative min-h-dvh w-full overflow-hidden bg-app text-txt-hi">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[120%] -translate-x-1/2 rounded-full bg-brand/15 blur-[100px]"
        animate={{ opacity: [0.4, 0.75, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))]"
      >
        <motion.div variants={itemVariants} className="flex justify-end">
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-txt-lo transition-colors hover:text-txt-hi"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
            Log out
          </button>
        </motion.div>

        <div className="mt-10">
          <motion.div variants={itemVariants} className="mb-6 w-fit">
            <div className="animate-float surface-premium grid h-14 w-14 place-items-center rounded-2xl text-brand">
              <KeyRound className="h-6 w-6" strokeWidth={1.75} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Eyebrow>Access</Eyebrow>
          </motion.div>

          <h1 className="mt-4 font-display text-[40px] font-semibold uppercase leading-none tracking-tight text-txt-hi">
            <span className="line-mask">
              <motion.span
                className="block"
                initial={{ y: '108%' }}
                animate={{ y: 0 }}
                transition={{ ...spring.gentle, delay: 0.2 }}
              >
                Enter your access code
              </motion.span>
            </span>
          </h1>

          <motion.p
            variants={itemVariants}
            className="mt-5 text-[15px] leading-relaxed text-txt-mid"
          >
            Card buyers: the license key in your Gumroad receipt email. Bank transfer buyers: the
            code I sent you on Instagram.
          </motion.p>
        </div>

        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Field label="Access code" htmlFor="access-code">
            <motion.div
              animate={error ? { x: [0, -7, 6, -4, 2, 0] } : { x: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
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
            </motion.div>
          </Field>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-brand"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

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
        </motion.form>
      </motion.div>
    </div>
  );
}
