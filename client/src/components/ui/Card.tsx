import { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'glass-card p-5',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-glow hover:border-primary/30',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
