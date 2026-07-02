import {
  Award,
  BookOpen,
  CheckCircle,
  FlaskConical,
  Flame,
  Gauge,
  Layers,
  MoveVertical,
  PlayCircle,
  Star,
  Trophy,
  Waves,
  type LucideProps,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

const MAP: Record<string, ComponentType<LucideProps>> = {
  'book-open': BookOpen,
  'play-circle': PlayCircle,
  'flask-conical': FlaskConical,
  'check-circle': CheckCircle,
  gauge: Gauge,
  waves: Waves,
  'move-vertical': MoveVertical,
  layers: Layers,
  trophy: Trophy,
  star: Star,
  flame: Flame,
  award: Award,
};

interface IconProps extends LucideProps {
  name: string;
  fallback?: ReactNode;
}

export function Icon({ name, fallback, ...props }: IconProps) {
  const Component = MAP[name];
  if (!Component) return <>{fallback ?? <Award {...props} />}</>;
  return <Component {...props} />;
}
