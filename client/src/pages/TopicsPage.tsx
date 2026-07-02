import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search } from 'lucide-react';
import { catalogApi } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';
import { TopicCard } from '@/components/TopicCard';
import { Input, Select } from '@/components/ui/Input';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/ui/States';
import { cn } from '@/utils/cn';

const STATUS_TABS = [
  { key: 'all', label: 'Барлығы' },
  { key: 'in-progress', label: 'Жалғасуда' },
  { key: 'completed', label: 'Аяқталған' },
  { key: 'not-started', label: 'Басталмаған' },
];

export function TopicsPage() {
  const [search, setSearch] = useState('');
  const [quarter, setQuarter] = useState<string>('');
  const [sectionId, setSectionId] = useState<string>('');
  const [status, setStatus] = useState('all');

  const quartersQuery = useQuery({ queryKey: ['quarters'], queryFn: catalogApi.quarters });

  const topicsQuery = useQuery({
    queryKey: ['topics', { quarter, sectionId, status }],
    queryFn: () =>
      catalogApi.topics({
        quarter: quarter ? Number(quarter) : undefined,
        sectionId: sectionId || undefined,
        status,
      }),
  });

  const sections = useMemo(() => {
    const qs = quartersQuery.data ?? [];
    const filtered = quarter ? qs.filter((q) => String(q.number) === quarter) : qs;
    return filtered.flatMap((q) => q.sections.map((s) => ({ ...s, quarterNumber: q.number })));
  }, [quartersQuery.data, quarter]);

  const topics = useMemo(() => {
    const list = topicsQuery.data ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((t) => t.title.toLowerCase().includes(q) || t.shortDescription.toLowerCase().includes(q));
  }, [topicsQuery.data, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Тақырыптар каталогы</h1>
        <p className="mt-2 text-muted">7-сынып физикасының барлық тақырыбы — тоқсан мен бөлім бойынша сүзгіле.</p>
      </header>

      {/* Filters */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Тақырыпты іздеу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Іздеу"
          />
        </div>
        <Select
          value={quarter}
          onChange={(e) => {
            setQuarter(e.target.value);
            setSectionId('');
          }}
          aria-label="Тоқсан"
        >
          <option value="">Барлық тоқсан</option>
          {(quartersQuery.data ?? []).map((q) => (
            <option key={q.id} value={q.number}>
              {q.number}-тоқсан
            </option>
          ))}
        </Select>
        <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)} aria-label="Бөлім">
          <option value="">Барлық бөлім</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </Select>
        <div className="flex overflow-x-auto rounded-xl border border-white/10 bg-background-secondary/60 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              className={cn(
                'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                status === tab.key ? 'bg-primary/20 text-primary' : 'text-muted hover:text-white',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {topicsQuery.isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : topicsQuery.isError ? (
        <ErrorState message={getErrorMessage(topicsQuery.error)} onRetry={() => topicsQuery.refetch()} />
      ) : topics.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="Тақырып табылмады"
          description="Сүзгіні өзгертіп көріңіз немесе басқа тоқсанды таңдаңыз."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {topics.map((t) => (
            <TopicCard key={t.id} topic={t} />
          ))}
        </div>
      )}
    </div>
  );
}
