export const XP_RULES = {
  TOPIC_OPEN: 5,
  VIDEO_COMPLETE: 20,
  SIMULATION_COMPLETE: 50,
  QUIZ_PASS: 50,
  QUIZ_PERFECT_BONUS: 30,
} as const;

export interface Level {
  name: string;
  min: number;
  max: number; // Infinity for the top level
}

export const LEVELS: Level[] = [
  { name: 'Бақылаушы', min: 0, max: 199 },
  { name: 'Ізденуші', min: 200, max: 499 },
  { name: 'Зерттеуші', min: 500, max: 999 },
  { name: 'Экспериментатор', min: 1000, max: 1999 },
  { name: 'Жас физик', min: 2000, max: Infinity },
];

export function levelForXP(xp: number): {
  index: number;
  name: string;
  currentLevelMin: number;
  nextLevelMin: number | null;
  progressToNext: number; // 0-100
} {
  const index = LEVELS.findIndex((l) => xp >= l.min && xp <= l.max);
  const safeIndex = index === -1 ? LEVELS.length - 1 : index;
  const level = LEVELS[safeIndex];
  const next = LEVELS[safeIndex + 1] ?? null;
  const nextLevelMin = next ? next.min : null;

  let progressToNext = 100;
  if (nextLevelMin !== null) {
    const span = nextLevelMin - level.min;
    progressToNext = Math.min(100, Math.round(((xp - level.min) / span) * 100));
  }

  return {
    index: safeIndex,
    name: level.name,
    currentLevelMin: level.min,
    nextLevelMin,
    progressToNext,
  };
}
