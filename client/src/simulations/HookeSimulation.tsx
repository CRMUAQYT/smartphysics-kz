import { useState } from 'react';
import { motion } from 'framer-motion';
import { SimulationShell, ResultCard, SliderControl } from './SimulationShell';

interface Props {
  onComplete?: () => void;
  completed?: boolean;
}

const G = 9.8;

export function HookeSimulation({ onComplete, completed }: Props) {
  const [mass, setMass] = useState(1); // kg
  const [k, setK] = useState(50); // N/m

  const force = mass * G; // gravity = elastic force at equilibrium
  const extension = force / k; // x = F/k (meters)
  const extensionCm = extension * 100;

  const reset = () => {
    setMass(1);
    setK(50);
  };

  return (
    <SimulationShell
      instructions="Жүк массасы мен серіппе қатаңдығын өзгерт. Серіппенің созылуы, серпімділік және ауырлық күштері нақты формулаға сай есептеледі: F = k·x."
      onReset={reset}
      onComplete={onComplete}
      completed={completed}
      controls={
        <>
          <SliderControl label="Жүк массасы" value={mass} min={0.1} max={5} step={0.1} unit="кг" onChange={setMass} />
          <SliderControl label="Серіппе қатаңдығы" value={k} min={10} max={200} step={5} unit="Н/м" onChange={setK} />
          <div className="rounded-lg bg-white/5 p-3 text-xs text-muted">
            Формула: <span className="font-mono text-primary">x = F / k</span>
          </div>
        </>
      }
      stage={<HookeStage extensionCm={extensionCm} force={force} />}
      results={
        <>
          <ResultCard label="Серпімділік күші" value={force.toFixed(1)} unit="Н" tone="primary" />
          <ResultCard label="Ауырлық күші" value={force.toFixed(1)} unit="Н" tone="danger" />
          <ResultCard label="Созылу" value={extensionCm.toFixed(1)} unit="см" tone="accent" />
          <ResultCard label="Қатаңдық" value={k} unit="Н/м" tone="success" />
        </>
      }
    />
  );
}

function HookeStage({ extensionCm, force }: { extensionCm: number; force: number }) {
  const baseCoils = 8;
  const springTop = 40;
  const naturalLength = 90;
  const stretchPx = Math.min(120, extensionCm * 4); // scale for display
  const springLength = naturalLength + stretchPx;
  const weightY = springTop + springLength;

  // build zig-zag spring path
  const coils = baseCoils;
  const segH = springLength / coils;
  let path = `M 200 ${springTop}`;
  for (let i = 0; i < coils; i++) {
    const y = springTop + segH * (i + 0.5);
    const x = 200 + (i % 2 === 0 ? 22 : -22);
    path += ` L ${x} ${y}`;
  }
  path += ` L 200 ${springTop + springLength}`;

  // Force–extension graph (linear)
  const maxX = 30; // cm
  const maxF = 60; // N

  return (
    <div className="grid gap-2 bg-gradient-to-b from-background-secondary to-background p-4 sm:grid-cols-2">
      <svg viewBox="0 0 400 300" className="h-auto w-full">
        {/* ceiling */}
        <rect x="120" y="28" width="160" height="12" rx="3" fill="rgba(255,255,255,0.2)" />
        {[...Array(8)].map((_, i) => (
          <line key={i} x1={128 + i * 20} y1="28" x2={120 + i * 20} y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        ))}
        {/* spring */}
        <motion.path d={path} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinejoin="round" initial={false} animate={{ d: path }} />
        {/* weight */}
        <motion.g initial={false} animate={{ y: weightY }}>
          <rect x="168" y="0" width="64" height="52" rx="8" fill="#e3ad25" stroke="#fff" strokeWidth="1.5" />
          <text x="200" y="30" textAnchor="middle" fontSize="13" fill="#07111f" fontWeight="bold">жүк</text>
        </motion.g>
        {/* force arrow */}
        <line x1="200" y1={weightY + 52} x2="200" y2={weightY + 52 + Math.min(50, force * 2)} stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowDown)" />
        <defs>
          <marker id="arrowDown" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#ef4444" transform="rotate(90 4 4)" />
          </marker>
        </defs>
      </svg>

      <div>
        <p className="mb-1 text-xs text-muted">Күш–ұзару графигі (F–x)</p>
        <svg viewBox="0 0 200 200" className="h-auto w-full">
          <line x1="20" y1="180" x2="190" y2="180" stroke="rgba(255,255,255,0.2)" />
          <line x1="20" y1="20" x2="20" y2="180" stroke="rgba(255,255,255,0.2)" />
          <line
            x1="20"
            y1="180"
            x2={20 + (Math.min(maxX, extensionCm) / maxX) * 170}
            y2={180 - (Math.min(maxF, force) / maxF) * 160}
            stroke="#13b5ea"
            strokeWidth="2.5"
          />
          <circle cx={20 + (Math.min(maxX, extensionCm) / maxX) * 170} cy={180 - (Math.min(maxF, force) / maxF) * 160} r="4" fill="#e3ad25" />
          <text x="185" y="195" fontSize="9" fill="#94a3b8" textAnchor="end">x (см)</text>
          <text x="6" y="26" fontSize="9" fill="#94a3b8">F (Н)</text>
        </svg>
      </div>
    </div>
  );
}
