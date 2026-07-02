import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { profileApi } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';
import { Icon } from '@/components/ui/Icon';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { formatDate } from '@/utils/gamification';
import { cn } from '@/utils/cn';

export function AchievementsPage() {
  const query = useQuery({ queryKey: ['achievements'], queryFn: profileApi.achievements });

  if (query.isLoading) return <LoadingState label="Жетістіктер жүктелуде..." />;
  if (query.isError) return <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />;

  const achievements = query.data ?? [];
  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Жетістіктер</h1>
        <p className="mt-1 text-muted">
          {unlocked} / {achievements.length} жетістік ашылды
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a, i) => (
          <motion.div
            key={a.code}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              'glass-card flex items-center gap-4 p-4 transition-all',
              a.unlocked ? 'border-accent/30' : 'opacity-60',
            )}
          >
            <div
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
                a.unlocked ? 'bg-gradient-to-br from-accent to-amber-500 text-background shadow-glow-accent' : 'bg-white/5 text-muted',
              )}
            >
              {a.unlocked ? <Icon name={a.icon} className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white">{a.title}</p>
              <p className="line-clamp-2 text-xs text-muted">{a.description}</p>
              {a.unlocked && a.unlockedAt ? (
                <p className="mt-1 text-xs text-accent">{formatDate(a.unlockedAt)}</p>
              ) : (
                <p className="mt-1 text-xs text-muted">+{a.xpReward} XP</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
