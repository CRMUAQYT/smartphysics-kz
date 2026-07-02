import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { adminApi } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { formatDate, levelColor } from '@/utils/gamification';

interface StudentDetail {
  id: string;
  fullName: string;
  email: string;
  grade: number;
  totalXP: number;
  currentStreak: number;
  level: { name: string; index: number; progressToNext: number; nextLevelMin: number | null };
  progress: { topic: string; slug: string; completed: boolean; bestQuizScore: number; earnedXP: number }[];
  quizAttempts: { topic: string; percentage: number; date: string }[];
  achievements: { code: string; title: string; unlockedAt: string }[];
}

export function AdminStudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ['admin-student', id],
    queryFn: () => adminApi.student(id!) as Promise<unknown>,
    enabled: !!id,
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />;
  const s = query.data as StudentDetail | undefined;
  if (!s) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/students')}>
        <ArrowLeft className="h-4 w-4" /> Оқушылар тізіміне
      </Button>

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white">
            {s.fullName[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{s.fullName}</h2>
            <p className="text-sm text-muted">{s.email}</p>
            <p className={`mt-1 text-sm font-semibold ${levelColor(s.level.index)}`}>
              {s.level.name} · {s.grade}-сынып
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-accent">{s.totalXP}</p>
            <p className="text-xs text-muted">XP · {s.currentStreak} күн серия</p>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar value={s.level.progressToNext} tone="accent" showLabel />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-white">Тақырыптар прогресі</h3>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {s.progress.length === 0 && <p className="text-sm text-muted">Прогресс жоқ</p>}
            {s.progress.map((p) => (
              <div key={p.slug} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm">
                {p.completed ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted" />
                )}
                <span className="flex-1 truncate text-slate-300">{p.topic}</span>
                <span className="text-xs text-muted">{p.bestQuizScore}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold text-white">Жетістіктер ({s.achievements.length})</h3>
          <div className="flex flex-wrap gap-2">
            {s.achievements.length === 0 && <p className="text-sm text-muted">Әзірше жоқ</p>}
            {s.achievements.map((a) => (
              <Badge key={a.code} tone="accent">
                {a.title}
              </Badge>
            ))}
          </div>

          <h3 className="mb-2 mt-5 font-semibold text-white">Соңғы тесттер</h3>
          <div className="space-y-1">
            {s.quizAttempts.slice(0, 6).map((q, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="truncate text-slate-300">{q.topic}</span>
                <span className="flex items-center gap-2 text-muted">
                  {q.percentage}% · {formatDate(q.date)}
                </span>
              </div>
            ))}
            {s.quizAttempts.length === 0 && <p className="text-sm text-muted">Тест жоқ</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
