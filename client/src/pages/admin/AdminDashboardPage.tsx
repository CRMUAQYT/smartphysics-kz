import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Eye, HelpCircle, PlayCircle, TrendingUp, Users } from 'lucide-react';
import { adminApi } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { formatDate } from '@/utils/gamification';

export function AdminDashboardPage() {
  const query = useQuery({ queryKey: ['admin-dashboard'], queryFn: adminApi.dashboard });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />;
  if (!query.data) return null;

  const { counts, avgQuizScore, topViewedTopics, recentStudents } = query.data;

  const tiles = [
    { icon: Users, label: 'Оқушылар', value: counts.students, tone: 'text-primary' },
    { icon: BookOpen, label: 'Жарияланған тақырып', value: counts.publishedTopics, tone: 'text-success' },
    { icon: PlayCircle, label: 'Видео', value: counts.videoCount, tone: 'text-danger' },
    { icon: HelpCircle, label: 'Тест сұрақтары', value: counts.questionCount, tone: 'text-accent' },
    { icon: TrendingUp, label: 'Орташа тест', value: `${avgQuizScore}%`, tone: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {tiles.map((t) => (
          <Card key={t.label} className="text-center">
            <t.icon className={`mx-auto h-6 w-6 ${t.tone}`} />
            <p className="mt-2 text-2xl font-bold text-white">{t.value}</p>
            <p className="text-xs text-muted">{t.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <Eye className="h-4 w-4 text-primary" /> Ең көп қаралған тақырыптар
          </h3>
          <div className="space-y-2">
            {topViewedTopics.length === 0 && <p className="text-sm text-muted">Дерек жоқ</p>}
            {topViewedTopics.map((t, i) => (
              <Link
                key={t.id}
                to={`/topics/${t.slug}`}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              >
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="text-muted">{i + 1}.</span> {t.title}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Eye className="h-3.5 w-3.5" /> {t.viewCount}
                </span>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <Users className="h-4 w-4 text-accent" /> Соңғы тіркелген оқушылар
          </h3>
          <div className="space-y-2">
            {recentStudents.length === 0 && <p className="text-sm text-muted">Дерек жоқ</p>}
            {recentStudents.map((s) => (
              <Link
                key={s.id}
                to={`/admin/students/${s.id}`}
                className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2 hover:bg-white/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                  {s.fullName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{s.fullName}</p>
                  <p className="truncate text-xs text-muted">{s.email}</p>
                </div>
                <span className="text-xs text-muted">{formatDate(s.createdAt)}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
