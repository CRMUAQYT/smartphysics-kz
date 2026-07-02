import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowRight, Award, BookCheck, Flame, FlaskConical, Target, Zap } from 'lucide-react';
import { profileApi } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { levelColor } from '@/utils/gamification';

export function DashboardPage() {
  const profile = useQuery({ queryKey: ['profile'], queryFn: profileApi.get });
  const progress = useQuery({ queryKey: ['profile-progress'], queryFn: profileApi.progress });
  const activity = useQuery({ queryKey: ['profile-activity'], queryFn: profileApi.activity });

  if (profile.isLoading) return <LoadingState label="Профиль жүктелуде..." />;
  if (profile.isError) return <ErrorState message={getErrorMessage(profile.error)} onRetry={() => profile.refetch()} />;
  if (!profile.data) return null;

  const { user, level, stats } = profile.data;

  const weeklyData = (activity.data ?? []).map((d) => ({
    day: new Date(d.date).toLocaleDateString('kk-KZ', { weekday: 'short' }),
    xp: d.xp,
  }));

  const quizData = (progress.data?.quizHistory ?? []).map((q, i) => ({
    name: `Т${i + 1}`,
    percentage: q.percentage,
  }));

  const sectionData = (progress.data?.sections ?? []).filter((s) => s.total > 0);

  return (
    <div className="space-y-6">
      {/* Hero row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white shadow-glow">
              {user.fullName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-bold text-white">{user.fullName}</h2>
              <p className="text-sm text-muted">{user.grade}-сынып</p>
              <p className={`mt-1 text-sm font-semibold ${levelColor(level.index)}`}>{level.name}</p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-3xl font-extrabold text-accent">{user.totalXP}</p>
              <p className="text-xs text-muted">жалпы XP</p>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>Деңгей прогресі</span>
              <span>
                {level.nextLevelMin ? `${user.totalXP} / ${level.nextLevelMin} XP` : 'Максималды деңгей'}
              </span>
            </div>
            <ProgressBar value={level.progressToNext} tone="accent" />
          </div>
        </Card>

        {/* Continue learning */}
        <Card className="flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Оқуды жалғастыру</p>
            {progress.data?.continueLearning ? (
              <p className="mt-2 line-clamp-2 text-sm text-muted">{progress.data.continueLearning.title}</p>
            ) : (
              <p className="mt-2 text-sm text-muted">Барлық басталған тақырып аяқталды 🎉</p>
            )}
          </div>
          <Link to={progress.data?.continueLearning ? `/topics/${progress.data.continueLearning.slug}` : '/topics'} className="mt-4">
            <Button fullWidth>
              {progress.data?.continueLearning ? 'Жалғастыру' : 'Тақырыптар'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatTile icon={Flame} label="Оқу сериясы" value={`${user.currentStreak} күн`} tone="text-accent" />
        <StatTile icon={BookCheck} label="Аяқталған" value={stats.completedTopics} tone="text-success" />
        <StatTile icon={Target} label="Орташа тест" value={`${stats.avgQuizScore}%`} tone="text-primary" />
        <StatTile icon={FlaskConical} label="Тәжірибе" value={stats.simulationsDone} tone="text-primary" />
        <StatTile icon={Award} label="Жетістік" value={stats.achievementsUnlocked} tone="text-accent" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <Zap className="h-4 w-4 text-accent" /> Апталық белсенділік (XP)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#13b5ea" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#13b5ea" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="xp" stroke="#13b5ea" strokeWidth={2} fill="url(#xpFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <Target className="h-4 w-4 text-primary" /> Тест нәтижелерінің динамикасы
          </h3>
          {quizData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={quizData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="percentage" stroke="#e3ad25" strokeWidth={2.5} dot={{ fill: '#e3ad25' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-muted">Әзірше тест тапсырылмаған</p>
          )}
        </Card>
      </div>

      {/* Section progress */}
      <Card>
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
          <BookCheck className="h-4 w-4 text-success" /> Бөлімдер бойынша прогресс
        </h3>
        {sectionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(200, sectionData.length * 34)}>
            <BarChart data={sectionData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
              <YAxis type="category" dataKey="title" width={140} stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, 'Прогресс']} />
              <Bar dataKey="percent" radius={[0, 6, 6, 0]}>
                {sectionData.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? '#13b5ea' : '#2864dc'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-8 text-center text-sm text-muted">Прогресс деректері жоқ</p>
        )}
      </Card>
    </div>
  );
}

const tooltipStyle = {
  background: '#0b172a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: '#fff',
  fontSize: 12,
};

function StatTile({ icon: Icon, label, value, tone }: { icon: typeof Flame; label: string; value: string | number; tone: string }) {
  return (
    <motion.div whileHover={{ y: -3 }}>
      <Card className="text-center">
        <Icon className={`mx-auto h-6 w-6 ${tone}`} />
        <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </Card>
    </motion.div>
  );
}
