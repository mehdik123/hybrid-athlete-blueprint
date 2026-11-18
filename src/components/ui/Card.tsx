import { forwardRef, PointerEvent } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  interactive?: boolean;
  accent?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, interactive, accent, children, onPointerMove, ...props },
  ref
) {
  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (interactive) {
      const rect = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
    }
    onPointerMove?.(e);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      className={cn(
        'rounded-3xl border bg-surface-2 p-5',
        accent ? 'border-brand/35' : 'border-white/8',
        interactive &&
          'spotlight transition-[border-color,box-shadow] duration-300 hover:border-white/20 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)]',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});
