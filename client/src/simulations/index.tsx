import type { SimulationType } from '@/types';
import { ArchimedesSimulation } from './ArchimedesSimulation';
import { MotionSimulation } from './MotionSimulation';
import { HookeSimulation } from './HookeSimulation';

interface SimulationRendererProps {
  type: SimulationType;
  onComplete?: () => void;
  completed?: boolean;
}

export const SIMULATION_META: Record<Exclude<SimulationType, 'NONE'>, { title: string; description: string }> = {
  ARCHIMEDES: { title: 'Архимед заңы', description: 'Денелердің жүзу шарттарын зертте' },
  MOTION: { title: 'Механикалық қозғалыс', description: 'Жылдамдық, жол және уақыт' },
  HOOKE: { title: 'Гук заңы', description: 'Серіппе және серпімділік күші' },
};

export function SimulationRenderer({ type, onComplete, completed }: SimulationRendererProps) {
  switch (type) {
    case 'ARCHIMEDES':
      return <ArchimedesSimulation onComplete={onComplete} completed={completed} />;
    case 'MOTION':
      return <MotionSimulation onComplete={onComplete} completed={completed} />;
    case 'HOOKE':
      return <HookeSimulation onComplete={onComplete} completed={completed} />;
    default:
      return null;
  }
}

export { ArchimedesSimulation, MotionSimulation, HookeSimulation };
