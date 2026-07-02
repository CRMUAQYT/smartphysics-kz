import { useState } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Gauge, MoveVertical, Waves } from 'lucide-react';
import { SimulationRenderer, SIMULATION_META } from '@/simulations';
import { cn } from '@/utils/cn';
import type { SimulationType } from '@/types';

const LABS: { type: Exclude<SimulationType, 'NONE'>; icon: typeof Waves }[] = [
  { type: 'ARCHIMEDES', icon: Waves },
  { type: 'MOTION', icon: Gauge },
  { type: 'HOOKE', icon: MoveVertical },
];

export function LabsPage() {
  const [active, setActive] = useState<Exclude<SimulationType, 'NONE'>>('ARCHIMEDES');

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-primary">
          <FlaskConical className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wide">Интерактивті зертханалар</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold text-white">Физиканы қолмен зертте</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Параметрлерді өзгертіп, күштерді, графиктерді және нәтижелерді нақты уақытта бақыла. Барлық есептеулер физикалық
          формулаларға негізделген.
        </p>
      </header>

      {/* Lab selector */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {LABS.map((lab) => {
          const meta = SIMULATION_META[lab.type];
          const isActive = active === lab.type;
          return (
            <button
              key={lab.type}
              onClick={() => setActive(lab.type)}
              className={cn(
                'flex items-center gap-3 rounded-2xl border p-4 text-left transition-all',
                isActive
                  ? 'border-primary bg-primary/10 shadow-glow'
                  : 'border-white/10 bg-card hover:border-white/20',
              )}
              aria-pressed={isActive}
            >
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', isActive ? 'bg-primary text-white' : 'bg-white/5 text-muted')}>
                <lab.icon className="h-5 w-5" />
              </div>
              <div>
                <p className={cn('font-semibold', isActive ? 'text-white' : 'text-slate-300')}>{meta.title}</p>
                <p className="text-xs text-muted">{meta.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <SimulationRenderer type={active} />
      </motion.div>
    </div>
  );
}
