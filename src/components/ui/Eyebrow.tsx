import { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface EyebrowProps {
  children: ReactNode;
  /** Show the 18×2 red rule on the left. */
  pip?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Label kicker: Barlow 600 11 / +0.14em / uppercase, optional red rule that draws in. */
export function Eyebrow({ children, pip = true, className, style }: EyebrowProps) {
  return (
    <span
      style={style}
      className={cn(
        'inline-flex w-fit items-center gap-2.5',
        'text-[11px] font-semibold uppercase tracking-[0.16em] text-txt-mid',
        className
      )}
    >
      {pip && (
        <motion.span
          className="block h-0.5 w-[18px] shrink-0 origin-left bg-brand"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay: 0.15 }}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
