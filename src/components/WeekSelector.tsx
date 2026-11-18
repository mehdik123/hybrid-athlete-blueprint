import { Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { TOTAL_WEEKS } from '../data/programConfig';
import { WeekStatus } from '../services/workoutService';
import { useLanguage } from '../contexts/LanguageContext';
import { haptic } from '../lib/haptics';
import { spring } from '../design/motion';
import { cn } from '../lib/utils';

interface WeekSelectorProps {
  /** Program progress week (shows Now). Independent of which week the user is browsing. */
  activeWeek: number;
  /** Week whose workouts are currently listed. */
  selectedWeek: number;
  weeks: Record<number, WeekStatus>;
  onWeekSelect: (week: number) => void;
  onLockedSelect?: (week: number) => void;
}

/** Week grid: 8 equal cells — now / done / locked. A selection ring glides between weeks. */
export default function WeekSelector({
  activeWeek,
  selectedWeek,
  weeks,
  onWeekSelect,
  onLockedSelect,
}: WeekSelectorProps) {
  const { t } = useLanguage();
  const list = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

  const statusOf = (week: number): WeekStatus => weeks[week] ?? 'locked';

  return (
    <div className="grid grid-cols-8 gap-[5px]">
      {list.map((week, i) => {
        const status = statusOf(week);
        const isNow = week === activeWeek;
        const isSelected = week === selectedWeek;
        const isDone = status === 'completed';
        const isLocked = status === 'locked';

        return (
          <motion.button
            key={week}
            type="button"
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...spring.gentle, delay: 0.04 * i }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              haptic.light();
              if (isLocked) onLockedSelect?.(week);
              else onWeekSelect(week);
            }}
            aria-disabled={isLocked}
            aria-current={isSelected ? 'true' : undefined}
            className={cn(
              'relative flex h-[58px] flex-col items-center justify-center gap-1.5 rounded-[10px] transition-colors duration-300',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60',
              isNow &&
                'bg-[linear-gradient(180deg,#F1263E,#D20F27)] shadow-[0_10px_22px_-12px_rgba(232,17,45,0.9),inset_0_1px_0_rgba(255,255,255,0.22)]',
              !isNow && isSelected && 'bg-surface-2',
              !isNow && !isSelected && 'bg-surface-1 hover:bg-surface-2',
              isLocked && 'opacity-80'
            )}
          >
            {isSelected && (
              <motion.span
                layoutId="week-ring"
                className={cn(
                  'pointer-events-none absolute inset-0 rounded-[10px]',
                  isNow ? 'ring-2 ring-inset ring-white/55' : 'ring-1 ring-inset ring-brand/70'
                )}
                transition={spring.snappy}
                aria-hidden
              />
            )}
            <span
              className={cn(
                'relative font-display text-[21px] font-semibold leading-none tabular-nums',
                isNow ? 'text-white' : isDone ? 'text-txt-hi' : 'text-txt-lo'
              )}
            >
              {week}
            </span>
            <span
              className={cn(
                'relative flex h-2.5 items-center text-[9px] font-semibold uppercase tracking-[0.12em]',
                isNow ? 'text-white' : isDone ? 'text-brand' : 'text-txt-lo'
              )}
            >
              {isNow ? (
                t('week.now')
              ) : isDone ? (
                <motion.span
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ ...spring.snappy, delay: 0.2 + 0.04 * i }}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                </motion.span>
              ) : (
                <Lock className="h-3 w-3" strokeWidth={2} />
              )}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
