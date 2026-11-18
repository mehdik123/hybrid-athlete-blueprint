import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { haptic } from '../../lib/haptics';
import { spring } from '../../design/motion';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children?: ReactNode;
  icon?: ReactNode;
  /** @deprecated Redesign CTAs are flat labels; subtitle is ignored visually. */
  subtitle?: ReactNode;
  arrow?: boolean;
}

const variants: Record<Variant, string> = {
  primary: cn(
    'text-white disabled:opacity-40',
    'bg-[linear-gradient(180deg,#F1263E_0%,#E8112D_52%,#D20F27_100%)]',
    'shadow-[0_12px_28px_-14px_rgba(232,17,45,0.85),inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-1px_0_rgba(0,0,0,0.2)]',
    'hover:brightness-110 active:brightness-95',
    'transition-[filter,box-shadow] duration-200'
  ),
  secondary: cn(
    'bg-white/[0.02] text-txt-hi disabled:opacity-40',
    'shadow-[inset_0_0_0_1px_#3E3B37,inset_0_1px_0_rgba(255,255,255,0.04)]',
    'hover:bg-white/[0.05] hover:shadow-[inset_0_0_0_1px_#57534D,inset_0_1px_0_rgba(255,255,255,0.06)]',
    'active:bg-white/[0.07]',
    'transition-[background-color,box-shadow] duration-200'
  ),
  ghost: cn(
    'bg-transparent text-txt-mid disabled:opacity-40',
    'hover:bg-white/[0.04] hover:text-txt-hi',
    'transition-colors duration-200'
  ),
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm rounded-[12px]',
  md: 'h-12 px-5 text-[15px] rounded-[14px]',
  lg: 'h-14 px-6 text-base rounded-[16px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  icon,
  subtitle: _subtitle,
  arrow,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.975, y: 0 }}
      transition={spring.snappy}
      onTapStart={() => !disabled && haptic.light()}
      disabled={disabled}
      className={cn(
        'group relative inline-flex select-none items-center justify-center gap-2.5',
        'font-semibold tracking-[0.01em]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'disabled:cursor-not-allowed',
        variant === 'primary' && !disabled && 'btn-shine',
        fullWidth && 'w-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {arrow && (
        <ArrowRight
          className="h-5 w-5 shrink-0 transition-transform duration-300 ease-smooth group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
          strokeWidth={1.75}
        />
      )}
    </motion.button>
  );
}
