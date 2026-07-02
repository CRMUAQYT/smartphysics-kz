import { motion } from 'framer-motion';

const FORMULAS = ['F = m·a', 'ρ = m/V', 'v = s/t', 'F = k·x', 'FА = ρgV', 'P = F/S', 'A = F·s', 'E = mc²'];

/** Physics formulas drifting subtly in the background. */
export function FloatingFormulas() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {FORMULAS.map((f, i) => (
        <motion.span
          key={f}
          className="absolute select-none font-mono text-sm text-primary/20 sm:text-base"
          style={{ top: `${(i * 13 + 8) % 90}%`, left: `${(i * 27 + 5) % 92}%` }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 0.6, 0], y: [-10, -40] }}
          transition={{ duration: 8 + i, repeat: Infinity, delay: i * 0.8, ease: 'easeInOut' }}
        >
          {f}
        </motion.span>
      ))}
    </div>
  );
}
