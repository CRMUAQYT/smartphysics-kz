import { create } from 'zustand';

interface AchievementState {
  queue: string[]; // achievement codes to celebrate
  celebrate: (codes: string[]) => void;
  dismiss: () => void;
}

/** Holds newly-unlocked achievement codes so the app can show a modal. */
export const useAchievementStore = create<AchievementState>((set) => ({
  queue: [],
  celebrate: (codes) => codes.length && set((s) => ({ queue: [...s.queue, ...codes] })),
  dismiss: () => set((s) => ({ queue: s.queue.slice(1) })),
}));
