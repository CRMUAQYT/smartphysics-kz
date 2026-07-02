import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

export function Logo({ className, to = '/' }: { className?: string; to?: string }) {
  return (
    <Link to={to} className={cn('group flex items-center gap-2.5', className)} aria-label="SmartPhysics KZ">
      <span className="relative flex h-9 w-9 items-center justify-center">
        <svg viewBox="0 0 64 64" className="h-9 w-9 transition-transform group-hover:rotate-12">
          <circle cx="32" cy="32" r="6" fill="#13b5ea" />
          <g fill="none" stroke="#38bdf8" strokeWidth="2.5">
            <ellipse cx="32" cy="32" rx="26" ry="11" />
            <ellipse cx="32" cy="32" rx="26" ry="11" transform="rotate(60 32 32)" />
            <ellipse cx="32" cy="32" rx="26" ry="11" transform="rotate(120 32 32)" />
          </g>
          <circle cx="58" cy="32" r="3" fill="#e3ad25" />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight">
        <span className="text-white">Smart</span>
        <span className="text-gradient">Physics</span>
        <span className="ml-1 text-accent">KZ</span>
      </span>
    </Link>
  );
}
