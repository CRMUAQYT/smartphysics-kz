import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

/** Animated atom with electrons orbiting on three tilted rings (SVG). */
export function AtomAnimation({ className }: { className?: string }) {
  const rings = [
    { rotate: 0, dur: 6 },
    { rotate: 60, dur: 9 },
    { rotate: 120, dur: 7.5 },
  ];

  return (
    <div className={cn('relative', className)} aria-hidden>
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <defs>
          <radialGradient id="nucleus" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2864dc" />
          </radialGradient>
        </defs>

        {rings.map((ring, i) => (
          <g key={i} transform={`rotate(${ring.rotate} 100 100)`}>
            <ellipse cx="100" cy="100" rx="90" ry="34" fill="none" stroke="rgba(56,189,248,0.35)" strokeWidth="1.2" />
          </g>
        ))}

        <circle cx="100" cy="100" r="12" fill="url(#nucleus)" />
        <circle cx="100" cy="100" r="12" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.5">
          <animate attributeName="r" values="12;18;12" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Electrons — CSS-driven orbits for smoothness */}
      {rings.map((ring, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{ rotate: ring.rotate }}
          animate={{ rotate: ring.rotate + 360 }}
          transition={{ duration: ring.dur, repeat: Infinity, ease: 'linear' }}
        >
          <div
            className="absolute h-3 w-3 rounded-full bg-primary shadow-glow"
            style={{ top: '50%', left: '5%', transform: 'translateY(-50%)' }}
          />
        </motion.div>
      ))}
    </div>
  );
}
