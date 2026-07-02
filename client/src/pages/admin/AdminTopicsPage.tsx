import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { toast } from '@/store/toast';

export function AdminTopicsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({ queryKey: ['admin-topics'], queryFn: adminApi.topics });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteTopic(id),
    onSuccess: () => {
      toast.success('Тақырып өшірілді');
      qc.invalidateQueries({ queryKey: ['admin-topics'] });
      setDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />;

  const topics = query.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Тақырыптар</h2>
          <p className="text-sm text-muted">{topics.length} тақырып</p>
        </div>
        <Button onClick={() => navigate('/admin/topics/new')}>
          <Plus className="h-4 w-4" /> Жаңа тақырып
        </Button>
      </div>

      {topics.length === 0 ? (
        <EmptyState title="Тақырып жоқ" action={<Button onClick={() => navigate('/admin/topics/new')}>Қосу</Button>} />
      ) : (
        <div className="glass-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Тақырып</th>
                  <th className="px-4 py-3">Тоқсан</th>
                  <th className="px-4 py-3">Сұрақ</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3 text-right">Әрекет</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topics.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{t.title}</p>
                      <p className="text-xs text-muted">{t.section?.title}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{t.section?.quarter.number}-тоқсан</td>
                    <td className="px-4 py-3 text-muted">{t._count?.questions ?? 0}</td>
                    <td className="px-4 py-3">
                      {t.isPublished ? (
                        <Badge tone="success">
                          <Eye className="h-3 w-3" /> Жарияланған
                        </Badge>
                      ) : (
                        <Badge tone="muted">
                          <EyeOff className="h-3 w-3" /> Жасырын
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link to={`/admin/topics/${t.id}`}>
                          <Button variant="ghost" size="sm" aria-label="Өңдеу">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(t.id)} aria-label="Өшіру">
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Тақырыпты өшіру"
        message="Бұл тақырып пен оған байланысты барлық сұрақ, прогресс өшіріледі. Растайсыз ба?"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
