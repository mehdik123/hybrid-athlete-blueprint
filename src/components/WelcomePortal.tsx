import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Button, ProgressRing, StatCounter } from './ui';
import { haptic } from '../lib/haptics';
import { TOTAL_WEEKS } from '../data/programConfig';
import { itemVariants, listVariants, spring } from '../design/motion';

interface WelcomePortalProps {
  onSelectTraining: () => void;
  onSignup: () => void;
  userName?: string;
  weekNumber?: number;
  setsDone?: number;
  setsTotal?: number;
  phaseLabel?: string;
}

function greetingKey(hour: number): string {
  if (hour < 12) return 'home.greet.morning';
  if (hour < 18) return 'home.greet.afternoon';
  return 'home.greet.evening';
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Home — greeting, current week status, one CTA into Train.
 * No “next session” tracking: the Train tab is the source of truth.
 */
export default function WelcomePortal({
  onSelectTraining,
  userName,
  weekNumber = 1,
  setsDone = 0,
  setsTotal = 96,
  phaseLabel,
}: WelcomePortalProps) {
  const { t } = useLanguage();
  const firstName = userName?.split(' ')[0] || t('app.athlete');
  const hour = new Date().getHours();
  const greet = t(greetingKey(hour), { name: firstName });
  const ratio = setsTotal > 0 ? Math.min(1, setsDone / setsTotal) : 0;
  const pct = Math.round(ratio * 100);

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="relative mx-auto min-h-[calc(100dvh-var(--chrome-height))] max-w-lg px-5 pb-nav-space pt-3"
    >
      <motion.p variants={itemVariants} className="text-[15px] font-medium text-txt-mid">
        {greet}
      </motion.p>

      <h1 className="mt-2.5 font-display text-[42px] font-semibold uppercase leading-none tracking-tight text-txt-hi">
        <span className="line-mask">
          <motion.span
            className="block"
            initial={{ y: '105%' }}
            animate={{ y: 0 }}
            transition={{ ...spring.gentle, delay: 0.1 }}
          >
            {t('home.ready')}
          </motion.span>
        </span>
      </h1>

      <motion.div
        variants={itemVariants}
        className="surface-premium spotlight relative mt-5 rounded-[22px] p-5"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
        }}
      >
        {/* Ambient light drifting behind the numeral */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full bg-brand/20 blur-3xl"
          animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.12, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-txt-lo">
            {t('home.thisWeek')}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-txt-mid">
            {t('home.weekOf', { week: weekNumber, total: TOTAL_WEEKS })}
          </span>
        </div>

        <div className="relative mt-4 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-end gap-2.5">
              <StatCounter
                value={weekNumber}
                format={pad2}
                className="font-display text-[72px] font-bold leading-[0.78] tracking-[-0.02em] tabular-nums text-txt-hi"
              />
              <span className="pb-1.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-txt-lo">
                {t('workout.week')}
              </span>
            </div>
            {phaseLabel && (
              <p className="mt-3 max-w-[11rem] text-[13px] font-medium leading-snug text-txt-mid">
                {phaseLabel}
              </p>
            )}
          </div>

          <ProgressRing
            value={ratio}
            size={84}
            strokeWidth={9}
            label={t('progress.ringLabel', { percent: pct })}
          />
        </div>

        <div className="prog-track relative mt-5">
          {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
            const w = i + 1;
            const filled = w < weekNumber ? 1 : w === weekNumber ? ratio : 0;
            const isCurrent = w === weekNumber && filled < 1;
            return (
              <i
                key={w}
                className={isCurrent ? 'animate-pulse-soft' : undefined}
                style={
                  isCurrent
                    ? { boxShadow: 'inset 0 0 0 1px #E8112D', background: 'transparent' }
                    : undefined
                }
              >
                {(filled > 0 || w < weekNumber) && (
                  <motion.b
                    className="!transition-none"
                    initial={{ width: 0 }}
                    animate={{ width: w < weekNumber ? '100%' : `${Math.max(filled * 100, 4)}%` }}
                    transition={{ ...spring.gentle, delay: 0.35 + i * 0.06 }}
                  />
                )}
              </i>
            );
          })}
        </div>

        <div className="relative mt-3 flex justify-between text-[13px] font-medium text-txt-mid">
          <span>{t('home.setsThisWeek', { done: setsDone, total: setsTotal })}</span>
          <span className="tabular-nums text-txt-lo">{pct}%</span>
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="relative mt-5"
          arrow
          onClick={() => {
            haptic.light();
            onSelectTraining();
          }}
        >
          {t('home.openWorkouts')}
        </Button>
      </motion.div>
    </motion.div>
  );
}
