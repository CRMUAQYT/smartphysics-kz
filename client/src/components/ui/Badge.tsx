import { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type Tone = 'primary' | 'accent' | 'success' | 'danger' | 'muted';

const tones: Record<Tone, string> = {
  primary: 'bg-primary/15 text-primary border-primary/30',
  accent: 'bg-accent/15 text-accent border-accent/30',
  success: 'bg-success/15 text-success border-success/30',
  danger: 'bg-danger/15 text-danger border-danger/30',
  muted: 'bg-white/5 text-muted border-white/10',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = 'muted', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
