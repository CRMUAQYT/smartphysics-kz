import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'accent' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-primary to-secondary text-white shadow-glow hover:shadow-glow-lg hover:brightness-110',
  secondary: 'bg-white/10 text-white hover:bg-white/15 border border-white/10',
  ghost: 'bg-transparent text-slate-300 hover:bg-white/5 hover:text-white',
  outline: 'bg-transparent border border-primary/50 text-primary hover:bg-primary/10',
  accent: 'bg-accent text-background font-semibold hover:brightness-105 shadow-glow-accent',
  danger: 'bg-danger/90 text-white hover:bg-danger',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-base gap-2.5 py-3.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'btn-focus inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
