import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SimulationShell, ResultCard, SliderControl } from './SimulationShell';

interface Props {
  onComplete?: () => void;
  completed?: boolean;
}

const TRACK_LENGTH = 100; // meters represented across the track

export function MotionSimulation({ onComplete, completed }: Props) {
  const [speed, setSpeed] = useState(10); // m/s
  const [startPos, setStartPos] = useState(0); // m
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0); // s
  const [position, setPosition] = useState(0); // m from origin
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    lastRef.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setTime((t) => t + dt);
      setPosition((p) => {
        const next = p + speed * dt;
        if (next >= TRACK_LENGTH) {
          setRunning(false);
          return TRACK_LENGTH;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, speed]);

  const reset = () => {
    setRunning(false);
    setTime(0);
    setPosition(startPos);
  };

  useEffect(() => {
    if (!running) setPosition(startPos);
  }, [startPos]); // eslint-disable-line react-hooks/exhaustive-deps

  const distance = Math.max(0, position - startPos);

  return (
    <SimulationShell
      instructions="Жылдамдық пен бастапқы орынды таңда, Start бас. Машина қозғалғанда жүрілген жол, уақыт және жол–уақыт графигі жаңарып отырады. s = v · t."
      onReset={reset}
      onComplete={onComplete}
      completed={completed}
      controls={
        <>
          <SliderControl label="Жылдамдық" value={speed} min={1} max={30} unit="м/с" onChange={(v) => setSpeed(v)} />
          <SliderControl label="Бастапқы орын" value={startPos} min={0} max={40} unit="м" onChange={(v) => setStartPos(v)} />
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant={running ? 'secondary' : 'primary'} onClick={() => setRunning((r) => !r)} fullWidth>
              {running ? <><Pause className="h-4 w-4" /> Пауза</> : <><Play className="h-4 w-4" /> Start</>}
            </Button>
            <Button size="sm" variant="ghost" onClick={reset} aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </>
      }
      stage={<MotionStage position={position} startPos={startPos} time={time} />}
      results={
        <>
          <ResultCard label="Жүрілген жол" value={distance.toFixed(1)} unit="м" tone="primary" />
          <ResultCard label="Уақыт" value={time.toFixed(1)} unit="с" tone="accent" />
          <ResultCard label="Жылдамдық" value={speed} unit="м/с" tone="success" />
          <ResultCard label="Ағымдағы орын" value={position.toFixed(1)} unit="м" tone="primary" />
        </>
      }
    />
  );
}

function MotionStage({ position, startPos, time }: { position: number; startPos: number; time: number }) {
  const trackX = (m: number) => 40 + (m / TRACK_LENGTH) * 320;

  // graph points: straight line s = v*t up to current time
  const maxT = Math.max(10, time);
  const graphW = 320;
  const graphH = 90;
  const gx = (t: number) => (t / maxT) * graphW;
  const gy = (s: number) => graphH - (s / TRACK_LENGTH) * graphH;

  return (
    <div className="bg-gradient-to-b from-background-secondary to-background p-4">
      <svg viewBox="0 0 400 160" className="h-auto w-full">
        {/* road */}
        <rect x="40" y="70" width="320" height="30" rx="4" fill="#0b172a" stroke="rgba(255,255,255,0.15)" />
        {/* lane marks */}
        {[...Array(11)].map((_, i) => (
          <line key={i} x1={40 + i * 32} y1="85" x2={40 + i * 32 + 12} y2="85" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="8 8" />
        ))}
        {/* start & finish */}
        <line x1={trackX(startPos)} y1="60" x2={trackX(startPos)} y2="110" stroke="#22c55e" strokeWidth="2" />
        <line x1={trackX(TRACK_LENGTH)} y1="60" x2={trackX(TRACK_LENGTH)} y2="110" stroke="#e3ad25" strokeWidth="2" />
        {/* car */}
        <g transform={`translate(${trackX(position) - 18}, 55)`}>
          <rect x="0" y="6" width="36" height="14" rx="4" fill="#13b5ea" />
          <rect x="7" y="0" width="20" height="9" rx="3" fill="#38bdf8" />
          <circle cx="9" cy="21" r="4" fill="#0b172a" stroke="#94a3b8" />
          <circle cx="27" cy="21" r="4" fill="#0b172a" stroke="#94a3b8" />
        </g>
      </svg>

      {/* graph */}
      <div className="mt-2">
        <p className="mb-1 text-xs text-muted">Жол–уақыт графигі (s–t)</p>
        <svg viewBox="0 0 340 110" className="h-auto w-full">
          <line x1="10" y1="100" x2="330" y2="100" stroke="rgba(255,255,255,0.2)" />
          <line x1="10" y1="10" x2="10" y2="100" stroke="rgba(255,255,255,0.2)" />
          <polyline
            points={`${10 + gx(0)},${10 + gy(startPos)} ${10 + gx(time)},${10 + gy(position)}`}
            fill="none"
            stroke="#13b5ea"
            strokeWidth="2.5"
          />
          <circle cx={10 + gx(time)} cy={10 + gy(position)} r="3.5" fill="#e3ad25" />
          <text x="320" y="98" fontSize="9" fill="#94a3b8" textAnchor="end">t</text>
          <text x="14" y="18" fontSize="9" fill="#94a3b8">s</text>
        </svg>
      </div>
    </div>
  );
}
