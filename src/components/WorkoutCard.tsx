import { Clock, List, ChevronRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { WorkoutDay } from '../types/workout';
import { haptic } from '../lib/haptics';
import { useLanguage } from '../contexts/LanguageContext';
import { dayName, localizeMinutes } from '../i18n/content';
import { itemVariants, spring } from '../design/motion';
import { cn } from '../lib/utils';

interface WorkoutCardProps {
  workout: WorkoutDay;
  onClick: () => void;
  completed?: boolean;
  /** Exercises fully logged / total (for partial tag). */
  progress?: { done: number; total: number };
  /** 1-based day index for the tile numeral. */
  dayIndex?: number;
}

/**
 * Day row. Done tag = every exercise logged that week.
 * Partial = "2/8" — no next-session guessing.
 * Must sit inside a staggered motion parent (listVariants) to animate in.
 */
export default function WorkoutCard({
  workout,
  onClick,
  completed = false,
  progress,
  dayIndex,
}: WorkoutCardProps) {
  const { t } = useLanguage();
  const n = dayIndex ?? 1;
  const partial =
    !completed && progress && progress.done > 0 && progress.done < progress.total;
  const ratio = completed
    ? 1
    : progress && progress.total > 0
      ? Math.min(1, progress.done / progress.total)
      : 0;

  return (
    <motion.button
      type="button"
      variants={itemVariants}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={spring.snappy}
      onClick={() => {
        haptic.light();
        onClick();
      }}
      className={cn(
        'group surface-premium relative flex h-[78px] w-full items-center gap-3.5 overflow-hidden rounded-2xl px-3.5 text-left',
        'transition-[background-color,box-shadow] duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60'
      )}
    >
      {completed && (
        <span
          className="absolute inset-y-4 left-0 w-[3px] rounded-r-full bg-brand shadow-[0_0_12px_rgba(232,17,45,0.8)]"
          aria-hidden
        />
      )}

      <span
        className={cn(
          'grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl font-display text-xl font-semibold tabular-nums transition-colors duration-300',
          completed
            ? 'bg-[linear-gradient(180deg,#F1263E,#D20F27)] text-white shadow-[0_8px_18px_-10px_rgba(232,17,45,0.9),inset_0_1px_0_rgba(255,255,255,0.22)]'
            : 'bg-surface-2 text-txt-mid group-hover:bg-surface-3 group-hover:text-txt-hi'
        )}
      >
        {completed ? (
          <motion.span
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={spring.snappy}
          >
            <Check className="h-5 w-5" strokeWidth={2.4} />
          </motion.span>
        ) : (
          n
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate text-[17px] font-semibold text-txt-hi">
            {dayName(t, workout.name)}
          </div>
          {completed && (
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">
              {t('workout.done')}
            </span>
          )}
          {partial && (
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-txt-lo">
              {progress.done}/{progress.total} · {t('workout.openToFinish')}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-txt-mid">
          <Clock className="h-3.5 w-3.5 text-txt-lo" strokeWidth={2} />
          <span>{localizeMinutes(t, workout.duration)}</span>
          <span className="mx-1.5 h-[11px] w-px bg-hair-strong" />
          <List className="h-3.5 w-3.5 text-txt-lo" strokeWidth={2} />
          <span>
            {workout.exercises.length} {t('home.exercises')}
          </span>
        </div>
      </div>

      <ChevronRight
        className="h-5 w-5 shrink-0 text-txt-lo transition-[transform,color] duration-300 ease-smooth group-hover:translate-x-1 group-hover:text-txt-hi rtl:rotate-180 rtl:group-hover:-translate-x-1"
        strokeWidth={1.75}
      />

      {ratio > 0 && (
        <motion.span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-brand/80"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: ratio }}
          transition={{ ...spring.gentle, delay: 0.3 }}
        />
      )}
    </motion.button>
  );
}
