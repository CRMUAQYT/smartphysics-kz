import { ReactNode } from 'react';
import { Logo } from '@/components/Logo';
import { AtomAnimation } from '@/components/decor/AtomAnimation';
import { FloatingFormulas } from '@/components/decor/FloatingFormulas';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Decorative panel */}
      <div className="relative hidden items-center justify-center overflow-hidden bg-background-secondary lg:flex">
        <div className="grid-bg absolute inset-0 opacity-40" />
        <FloatingFormulas />
        <div className="relative z-10 flex flex-col items-center px-10 text-center">
          <AtomAnimation className="h-56 w-56 animate-float" />
          <h2 className="mt-8 text-3xl font-bold text-white">Физиканы жаттама.<br /><span className="text-gradient">Зертте. Дәлелде.</span></h2>
          <p className="mt-3 max-w-sm text-muted">7-сынып физикасын интерактивті түрде үйрен.</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:justify-start">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
