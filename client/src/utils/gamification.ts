export const ACHIEVEMENT_META: Record<string, { title: string; icon: string }> = {
  FIRST_LESSON: { title: 'Алғашқы сабақ', icon: 'book-open' },
  FIRST_VIDEO: { title: 'Алғашқы видео', icon: 'play-circle' },
  FIRST_SIMULATION: { title: 'Алғашқы тәжірибе', icon: 'flask-conical' },
  FIRST_QUIZ: { title: 'Алғашқы тест', icon: 'check-circle' },
  SPEED_MASTER: { title: 'Жылдамдық шебері', icon: 'gauge' },
  ARCHIMEDES_FOLLOWER: { title: 'Архимед ізбасары', icon: 'waves' },
  HOOKE_RESEARCHER: { title: 'Гук заңының зерттеушісі', icon: 'move-vertical' },
  FIVE_TOPICS: { title: '5 тақырып аяқталды', icon: 'layers' },
  TEN_TOPICS: { title: '10 тақырып аяқталды', icon: 'trophy' },
  FIVE_PERFECT: { title: '5 тесттен 100%', icon: 'star' },
  STREAK_3: { title: '3 күндік оқу сериясы', icon: 'flame' },
  STREAK_7: { title: '7 күндік оқу сериясы', icon: 'flame' },
};

export const LEVEL_COLORS = [
  'text-slate-300',
  'text-primary',
  'text-emerald-400',
  'text-accent',
  'text-fuchsia-400',
];

export function levelColor(index: number): string {
  return LEVEL_COLORS[Math.min(index, LEVEL_COLORS.length - 1)];
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('kk-KZ', { day: 'numeric', month: 'short', year: 'numeric' });
}
