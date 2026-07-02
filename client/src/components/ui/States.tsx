import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-6 w-6 animate-spin text-primary', className)} aria-label="Жүктелуде" />;
}

export function LoadingState({ label = 'Жүктелуде...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
      <Spinner className="h-8 w-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-xl bg-white/5', className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card space-y-4 p-5">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function EmptyState({
  title = 'Дерек жоқ',
  description,
  icon,
  action,
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="rounded-2xl bg-white/5 p-4 text-muted">{icon ?? <Inbox className="h-8 w-8" />}</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="rounded-2xl bg-danger/10 p-4 text-danger">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-white">Қате орын алды</h3>
      <p className="max-w-sm text-sm text-muted">{message ?? 'Деректерді жүктеу мүмкін болмады'}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Қайта көру
        </Button>
      )}
    </div>
  );
}
