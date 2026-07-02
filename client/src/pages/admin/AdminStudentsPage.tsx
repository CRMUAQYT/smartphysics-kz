import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { adminApi } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';

export function AdminStudentsPage() {
  const [search, setSearch] = useState('');
  const query = useQuery({ queryKey: ['admin-students'], queryFn: adminApi.students });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />;

  const students = (query.data ?? []).filter(
    (s) => s.fullName.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Оқушылар</h2>
          <p className="text-sm text-muted">{query.data?.length ?? 0} оқушы</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input placeholder="Іздеу..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState title="Оқушы табылмады" />
      ) : (
        <div className="glass-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Оқушы</th>
                  <th className="px-4 py-3">Сынып</th>
                  <th className="px-4 py-3">Деңгей</th>
                  <th className="px-4 py-3">XP</th>
                  <th className="px-4 py-3">Аяқталған</th>
                  <th className="px-4 py-3">Орташа тест</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((s) => (
                  <tr key={s.id} className="cursor-pointer hover:bg-white/5">
                    <td className="px-4 py-3">
                      <Link to={`/admin/students/${s.id}`} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                          {s.fullName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-white">{s.fullName}</p>
                          <p className="text-xs text-muted">{s.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{s.grade}-сынып</td>
                    <td className="px-4 py-3">
                      <Badge tone="primary">{s.level}</Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-accent">{s.totalXP}</td>
                    <td className="px-4 py-3 text-muted">{s.completedTopics}</td>
                    <td className="px-4 py-3 text-muted">{s.avgQuizScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
