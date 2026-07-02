import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

const base =
  'w-full rounded-xl border border-white/10 bg-background-secondary/60 px-4 py-2.5 text-sm text-white placeholder:text-muted transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50';

interface FieldWrapProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
}

export function Field({ label, error, hint, required, children, htmlFor }: FieldWrapProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(base, className)} {...props} />,
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(base, 'min-h-[100px] resize-y', className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(base, 'cursor-pointer', className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = 'Select';
