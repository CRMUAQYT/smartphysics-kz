import { AnimatePresence, motion } from 'framer-motion';
import { Award, Sparkles } from 'lucide-react';
import { useAchievementStore } from '@/store/achievements';
import { ACHIEVEMENT_META } from '@/utils/gamification';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

/** Full-screen celebration modal shown whenever an achievement is unlocked. */
export function AchievementCelebration() {
  const { queue, dismiss } = useAchievementStore();
  const code = queue[0];
  const meta = code ? ACHIEVEMENT_META[code] : null;

  return (
    <AnimatePresence>
      {meta && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-background/85 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="glass-card relative z-10 w-full max-w-sm overflow-hidden p-8 text-center"
          >
            {/* sparkles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-accent"
                style={{ top: `${10 + (i % 4) * 22}%`, left: `${(i * 13) % 90}%` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: 180 }}
                transition={{ duration: 1.6, delay: i * 0.12, repeat: Infinity, repeatDelay: 1 }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
            ))}

            <motion.div
              className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-accent to-amber-500 shadow-glow-accent"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              <Icon name={meta.icon} className="h-12 w-12 text-background" fallback={<Award className="h-12 w-12 text-background" />} />
            </motion.div>

            <p className="text-sm font-medium uppercase tracking-wider text-accent">Жаңа жетістік!</p>
            <h3 className="mt-1 text-2xl font-bold text-white">{meta.title}</h3>
            <p className="mt-2 text-sm text-muted">Керемет! Жаңа белес алдыңыз.</p>

            <Button variant="accent" className="mt-6" fullWidth onClick={dismiss}>
              Тамаша!
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
