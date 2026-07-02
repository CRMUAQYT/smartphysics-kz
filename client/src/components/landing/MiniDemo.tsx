import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { SliderControl } from '@/simulations/SimulationShell';

/** Small always-on interactive demo shown on the landing page. */
export function MiniDemo() {
  const [force, setForce] = useState(20); // N
  const [massKg] = useState(2);
  const accel = force / massKg; // a = F/m
  const [pos, setPos] = useState(20);
  const dir = useRef(1);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setPos((p) => {
        let next = p + dir.current * accel * dt * 4;
        if (next > 260) {
          next = 260;
          dir.current = -1;
        } else if (next < 20) {
          next = 20;
          dir.current = 1;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [accel]);

  return (
    <Card className="w-full max-w-md">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Тірі демо: Ньютон 2-заңы</p>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">a = F / m</span>
      </div>

      <svg viewBox="0 0 300 90" className="h-auto w-full">
        <rect x="10" y="55" width="280" height="16" rx="4" fill="#0b172a" stroke="rgba(255,255,255,0.12)" />
        <motion.g style={{ x: pos }}>
          <rect x="-16" y="34" width="32" height="20" rx="4" fill="#13b5ea" />
          <circle cx="-8" cy="55" r="4" fill="#0b172a" stroke="#94a3b8" />
          <circle cx="8" cy="55" r="4" fill="#0b172a" stroke="#94a3b8" />
        </motion.g>
        <line x1={pos + 16} y1="44" x2={pos + 16 + force / 1.5} y2="44" stroke="#e3ad25" strokeWidth="2.5" markerEnd="url(#demoArrow)" />
        <defs>
          <marker id="demoArrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="#e3ad25" />
          </marker>
        </defs>
      </svg>

      <div className="mt-3">
        <SliderControl label="Күш (F)" value={force} min={5} max={60} unit="Н" onChange={setForce} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm">
        <div className="rounded-lg bg-white/5 py-2">
          <p className="text-xs text-muted">Масса</p>
          <p className="font-bold text-white">{massKg} кг</p>
        </div>
        <div className="rounded-lg bg-white/5 py-2">
          <p className="text-xs text-muted">Үдеу</p>
          <p className="font-bold text-accent">{accel.toFixed(1)} м/с²</p>
        </div>
      </div>
    </Card>
  );
}
