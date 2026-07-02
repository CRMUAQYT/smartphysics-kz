import { ReactNode } from 'react';
import { Info, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SimulationShellProps {
  instructions: string;
  controls: ReactNode;
  stage: ReactNode;
  results: ReactNode;
  onReset: () => void;
  onComplete?: () => void;
  completeLabel?: string;
  completed?: boolean;
}

/** Consistent layout used by every simulation: instructions, controls, stage, results. */
export function SimulationShell({
  instructions,
  controls,
  stage,
  results,
  onReset,
  onComplete,
  completeLabel = 'Тәжірибені аяқтау',
  completed,
}: SimulationShellProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-slate-300">{instructions}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="glass-card space-y-4 p-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted">Параметрлер</h4>
          {controls}
        </div>

        <div className="space-y-4">
          <div className="glass-card overflow-hidden p-0">{stage}</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{results}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Қайта бастау
        </Button>
        {onComplete && (
          <Button variant="accent" onClick={onComplete} disabled={completed}>
            {completed ? 'Аяқталды ✓' : completeLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export function ResultCard({ label, value, unit, tone }: { label: string; value: string | number; unit?: string; tone?: 'primary' | 'accent' | 'success' | 'danger' }) {
  const toneClass = {
    primary: 'text-primary',
    accent: 'text-accent',
    success: 'text-success',
    danger: 'text-danger',
  }[tone ?? 'primary'];
  return (
    <div className="glass-card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-xl font-bold ${toneClass}`}>
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-muted">{unit}</span>}
      </p>
    </div>
  );
}

export function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-sm font-semibold text-primary">
          {value}
          {unit && <span className="ml-0.5 text-xs text-muted">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-primary"
        aria-label={label}
      />
    </div>
  );
}
