import { motion } from 'framer-motion';
import { spring } from '../../design/motion';
import { cn } from '../../lib/utils';

interface AnimatedProgressProps {
  /** 0–100 */
  value: number;
  className?: string;
  /** Tailwind height class. */
  height?: string;
}

/** Spring-filled progress bar with a soft sheen travelling along the fill. */
export function AnimatedProgress({ value, className, height = 'h-1' }: AnimatedProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn('relative overflow-hidden rounded-full bg-surface-3', height, className)}
    >
      <motion.div
        className="relative h-full overflow-hidden rounded-full bg-[linear-gradient(90deg,#D20F27,#F1263E)]"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={spring.ring}
      >
        {pct > 4 && <span className="progress-sheen absolute inset-0" />}
      </motion.div>
    </div>
  );
}
