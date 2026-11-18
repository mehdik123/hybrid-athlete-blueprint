import { Home, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { haptic } from '../lib/haptics';
import { spring } from '../design/motion';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeView?: 'welcome' | 'intro' | 'workouts';
  onViewChange?: (view: 'welcome' | 'intro' | 'workouts') => void;
}

const tabs = [
  { id: 'welcome' as const, icon: Home, labelKey: 'nav.home' },
  { id: 'workouts' as const, icon: Dumbbell, labelKey: 'nav.train', matchIntro: true },
];

/** Frosted nav: the active highlight and red rule glide between tabs. */
export default function BottomNav({ activeView, onViewChange }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleNav = (target: 'welcome' | 'workouts') => {
    haptic.light();
    onViewChange?.(target === 'workouts' && !user ? 'intro' : target);
    if (location.pathname !== '/') navigate('/');
  };

  const isActive = (tab: (typeof tabs)[number]) => {
    if (tab.matchIntro) return activeView === 'workouts' || activeView === 'intro';
    return activeView === tab.id;
  };

  return (
    <nav
      className="glass-bar fixed inset-x-0 bottom-0 z-[100] border-t border-hair/70"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex h-[62px] max-w-lg px-8 pt-2">
        {tabs.map((tab) => {
          const active = isActive(tab);
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => handleNav(tab.id)}
              whileTap={{ scale: 0.93 }}
              transition={spring.snappy}
              aria-label={t(tab.labelKey)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl',
                'text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors duration-300',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50',
                active ? 'text-txt-hi' : 'text-txt-lo hover:text-txt-mid'
              )}
            >
              {active && (
                <>
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-x-3 inset-y-0.5 rounded-2xl bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    transition={spring.snappy}
                    aria-hidden
                  />
                  <motion.span
                    layoutId="nav-rule"
                    className="absolute -top-[9px] h-0.5 w-6 rounded-sm bg-brand shadow-[0_0_10px_rgba(232,17,45,0.8)]"
                    transition={spring.snappy}
                    aria-hidden
                  />
                </>
              )}
              <motion.span
                className="relative"
                animate={{ y: active ? -1 : 0, scale: active ? 1.1 : 1 }}
                transition={spring.snappy}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.75} />
              </motion.span>
              <span className="relative">{t(tab.labelKey)}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
