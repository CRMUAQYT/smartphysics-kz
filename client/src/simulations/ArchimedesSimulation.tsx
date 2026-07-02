import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { SimulationShell, ResultCard, SliderControl } from './SimulationShell';

const MATERIALS: Record<string, { label: string; density: number }> = {
  wood: { label: 'Ағаш', density: 600 },
  ice: { label: 'Мұз', density: 917 },
  plastic: { label: 'Пластик', density: 950 },
  aluminum: { label: 'Алюминий', density: 2700 },
  stone: { label: 'Тас', density: 2600 },
  iron: { label: 'Темір', density: 7870 },
};

const LIQUIDS: Record<string, { label: string; density: number; color: string }> = {
  water: { label: 'Су', density: 1000, color: '#2864dc' },
  saltwater: { label: 'Тұзды су', density: 1030, color: '#1e7fa8' },
  oil: { label: 'Май', density: 920, color: '#b8860b' },
  alcohol: { label: 'Спирт', density: 789, color: '#6d28d9' },
};

const G = 9.8;

interface Props {
  onComplete?: () => void;
  completed?: boolean;
}

export function ArchimedesSimulation({ onComplete, completed }: Props) {
  const [material, setMaterial] = useState('wood');
  const [liquid, setLiquid] = useState('water');
  const [volume, setVolume] = useState(1000); // cm³
  const [mass, setMass] = useState(600); // grams — derived default

  const bodyDensity = mass / volume; // g/cm³  → *1000 = kg/m³
  const bodyDensityKg = bodyDensity * 1000;
  const liquidDensity = LIQUIDS[liquid].density;

  const volumeM3 = volume / 1_000_000; // cm³ → m³
  const massKg = mass / 1000;
  const gravity = massKg * G; // N

  // Submerged fraction: floats -> ρbody/ρliquid, sinks -> fully submerged
  const floats = bodyDensityKg < liquidDensity;
  const submergedFraction = floats ? bodyDensityKg / liquidDensity : 1;
  const buoyancy = liquidDensity * G * volumeM3 * submergedFraction;

  const verdict = useMemo(() => {
    if (Math.abs(bodyDensityKg - liquidDensity) < 5) return { text: 'Тепе-теңдік сақтайды', tone: 'accent' as const };
    return floats ? { text: 'Жүзеді', tone: 'success' as const } : { text: 'Батады', tone: 'danger' as const };
  }, [bodyDensityKg, liquidDensity, floats]);

  const reset = () => {
    setMaterial('wood');
    setLiquid('water');
    setVolume(1000);
    setMass(600);
  };

  // When material changes, seed a realistic mass from its density
  const onMaterial = (key: string) => {
    setMaterial(key);
    setMass(Math.round((MATERIALS[key].density / 1000) * volume));
  };

  // Visual: depth the body sinks into the liquid (0..1 of liquid height)
  const sinkDepth = floats ? submergedFraction : 1;

  return (
    <SimulationShell
      instructions="Дене материалын, көлемін, массасын және сұйықты өзгертіп, дене батады ма әлде жүзеді ме — бақыла. Архимед күшін ауырлық күшімен салыстыр."
      onReset={reset}
      onComplete={onComplete}
      completed={completed}
      controls={
        <>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Материал</label>
            <Select value={material} onChange={(e) => onMaterial(e.target.value)}>
              {Object.entries(MATERIALS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label} ({v.density} кг/м³)
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Сұйық</label>
            <Select value={liquid} onChange={(e) => setLiquid(e.target.value)}>
              {Object.entries(LIQUIDS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label} ({v.density} кг/м³)
                </option>
              ))}
            </Select>
          </div>
          <SliderControl label="Көлем" value={volume} min={200} max={3000} step={50} unit="см³" onChange={setVolume} />
          <SliderControl label="Масса" value={mass} min={50} max={20000} step={50} unit="г" onChange={setMass} />
          <div className="rounded-lg bg-white/5 p-3 text-xs text-muted">
            Дене тығыздығы: <span className="font-semibold text-primary">{Math.round(bodyDensityKg)} кг/м³</span>
          </div>
        </>
      }
      stage={<ArchimedesStage liquidColor={LIQUIDS[liquid].color} sinkDepth={sinkDepth} floats={floats} gravity={gravity} buoyancy={buoyancy} />}
      results={
        <>
          <ResultCard label="Ауырлық күші" value={gravity.toFixed(1)} unit="Н" tone="danger" />
          <ResultCard label="Архимед күші" value={buoyancy.toFixed(1)} unit="Н" tone="primary" />
          <ResultCard label="Сұйық тығыздығы" value={liquidDensity} unit="кг/м³" tone="accent" />
          <div className="glass-card flex flex-col justify-center p-4">
            <p className="text-xs text-muted">Қорытынды</p>
            <Badge tone={verdict.tone} className="mt-1 w-fit text-sm">
              {verdict.text}
            </Badge>
          </div>
        </>
      }
    />
  );
}

function ArchimedesStage({
  liquidColor,
  sinkDepth,
  floats,
  gravity,
  buoyancy,
}: {
  liquidColor: string;
  sinkDepth: number;
  floats: boolean;
  gravity: number;
  buoyancy: number;
}) {
  const liquidTop = 130; // y where liquid surface is
  const containerBottom = 340;
  const bodySize = 70;
  // body top position: when floating, only sinkDepth of the body is below surface
  const submergedPx = sinkDepth * bodySize;
  const bodyY = floats ? liquidTop - (bodySize - submergedPx) : Math.min(liquidTop + (containerBottom - liquidTop - bodySize) , liquidTop + 10);

  return (
    <svg viewBox="0 0 400 380" className="h-full w-full bg-gradient-to-b from-background-secondary to-background">
      {/* container */}
      <rect x="80" y="60" width="240" height="290" rx="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
      {/* liquid */}
      <motion.rect
        x="83"
        width="234"
        rx="4"
        fill={liquidColor}
        opacity="0.55"
        initial={false}
        animate={{ y: liquidTop, height: containerBottom - liquidTop }}
      />
      {/* surface line */}
      <line x1="83" y1={liquidTop} x2="317" y2={liquidTop} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* body */}
      <motion.g initial={false} animate={{ y: bodyY }} transition={{ type: 'spring', stiffness: 60, damping: 12 }}>
        <rect x={200 - bodySize / 2} y={0} width={bodySize} height={bodySize} rx="8" fill="#e3ad25" stroke="#fff" strokeWidth="1.5" />
        <text x="200" y={bodySize / 2 + 5} textAnchor="middle" fontSize="12" fill="#07111f" fontWeight="bold">
          дене
        </text>
      </motion.g>

      {/* Force arrows */}
      {/* gravity (down) */}
      <g>
        <line x1="200" y1="30" x2="200" y2={30 + Math.min(60, gravity * 2)} stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowRed)" />
        <text x="210" y="45" fill="#ef4444" fontSize="11">Fауыр</text>
      </g>
      {/* buoyancy (up) */}
      <g>
        <line x1="150" y1="350" x2="150" y2={350 - Math.min(80, buoyancy * 2)} stroke="#13b5ea" strokeWidth="3" markerEnd="url(#arrowBlue)" />
        <text x="90" y="345" fill="#13b5ea" fontSize="11">FАрхимед</text>
      </g>

      <defs>
        <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#ef4444" />
        </marker>
        <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,8 L8,4 L0,0 Z" fill="#13b5ea" />
        </marker>
      </defs>
    </svg>
  );
}
