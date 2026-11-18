import { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { spring } from '../../design/motion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Start offset in px. */
  y?: number;
}

/** Fade + lift into place the first time the block scrolls into view. */
export function Reveal({ children, className, delay = 0, y = 16 }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ ...spring.gentle, delay }}
    >
      {children}
    </motion.div>
  );
}
