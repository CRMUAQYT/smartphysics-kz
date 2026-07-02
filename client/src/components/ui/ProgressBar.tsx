import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  tone?: 'primary' | 'accent' | 'success';
  showLabel?: boolean;
}

const tones = {
  primary: 'from-primary to-secondary',
  accent: 'from-accent to-amber-500',
  success: 'from-success to-emerald-400',
};

export function ProgressBar({ value, className, tone = 'primary', showLabel }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={cn('h-full rounded-full bg-gradient-to-r', tones[tone])}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      {showLabel && <span className="w-10 text-right text-xs font-medium text-muted">{clamped}%</span>}
    </div>
  );
}
