import { X } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Button, BrandMark, Eyebrow, IconButton } from './ui';
import LanguageToggle from './LanguageToggle';
import { spring } from '../design/motion';

interface AuthChoiceModalProps {
  onClose: () => void;
  onJoin: () => void;
  onLogin: () => void;
  dismissible?: boolean;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: spring.gentle },
};

const lineReveal: Variants = {
  hidden: { y: '108%' },
  show: { y: 0, transition: { ...spring.gentle, stiffness: 140 } },
};

/** Auth entry: slow-zoom coach photo, masked headline reveal, staggered CTAs. */
export default function AuthChoiceModal({
  onClose,
  onJoin,
  onLogin,
  dismissible = false,
}: AuthChoiceModalProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[150] overflow-hidden bg-bg"
    >
      {/* Full-bleed hero */}
      <div className="absolute inset-x-0 top-0 h-[min(500px,62dvh)] overflow-hidden">
        <motion.img
          src="/images/coach_hero.jpg"
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="animate-kenburns h-full w-full object-cover"
          style={{
            objectPosition: '50% 30%',
            filter: 'saturate(0.82) contrast(1.06) brightness(0.88)',
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg,rgba(17,17,16,.88) 0%,rgba(17,17,16,.5) 12%,rgba(17,17,16,0) 24%,rgba(17,17,16,0) 34%,rgba(17,17,16,.78) 56%,rgba(17,17,16,.96) 72%,#111110 86%)',
          }}
        />
      </div>

      {/* Ambient red light rising from the CTA area */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-[120%] -translate-x-1/2 rounded-full bg-brand/20 blur-[90px]"
        animate={{ opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring.gentle, delay: 0.1 }}
          className="flex items-center justify-between px-5 pt-[max(0.75rem,env(safe-area-inset-top))]"
        >
          <BrandMark />
          <div className="flex items-center gap-3">
            <LanguageToggle />
            {dismissible && (
              <IconButton aria-label="close" onClick={onClose}>
                <X className="h-4 w-4" strokeWidth={1.75} />
              </IconButton>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-auto px-6 pb-[max(2rem,env(safe-area-inset-bottom))]"
        >
          <motion.div variants={rise}>
            <Eyebrow>{t('welcome.eyebrow')}</Eyebrow>
          </motion.div>

          <h1 className="mt-3.5 font-display text-[clamp(3.5rem,14vw,4.5rem)] font-bold uppercase leading-[0.84] tracking-[-0.01em] text-txt-hi">
            <span className="line-mask">
              <motion.span variants={lineReveal} className="block">
                Hybrid
              </motion.span>
            </span>
            <span className="line-mask">
              <motion.span variants={lineReveal} className="block">
                athlete
              </motion.span>
            </span>
          </h1>

          <motion.p
            variants={rise}
            className="mt-4 max-w-[21rem] text-[15px] font-normal leading-[22px] text-txt-mid"
          >
            {t('welcome.tagline')}
          </motion.p>

          <motion.div
            variants={rise}
            className="mt-[18px] flex items-center text-[11px] font-semibold uppercase tracking-[0.14em] text-txt-lo"
          >
            <span>{t('welcome.stat.program')}</span>
            <span className="mx-3 inline-block h-[11px] w-px bg-hair-strong" aria-hidden />
            <span>{t('welcome.stat.sessions')}</span>
            <span className="mx-3 inline-block h-[11px] w-px bg-hair-strong" aria-hidden />
            <span>{t('welcome.stat.focus')}</span>
          </motion.div>

          <motion.div variants={rise} className="mt-7 grid gap-2.5">
            <Button variant="primary" size="lg" fullWidth onClick={onJoin} arrow>
              {t('common.createAccount')}
            </Button>
            <Button variant="secondary" size="lg" fullWidth onClick={onLogin}>
              {t('common.login')}
            </Button>
          </motion.div>

          <motion.p
            variants={rise}
            className="mt-[18px] text-center text-[12px] font-medium tracking-[0.02em] text-txt-lo"
          >
            {t('welcome.trust')}
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
