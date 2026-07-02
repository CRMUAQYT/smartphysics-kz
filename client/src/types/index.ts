export type Role = 'ADMIN' | 'STUDENT';
export type SimulationType = 'NONE' | 'ARCHIMEDES' | 'MOTION' | 'HOOKE';
export type QuestionType = 'SINGLE' | 'MULTIPLE' | 'BOOLEAN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  grade: number;
  avatar: string;
  totalXP: number;
  currentStreak: number;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Quarter {
  id: string;
  number: number;
  title: string;
  description?: string | null;
  sections: Section[];
}

export interface Section {
  id: string;
  quarterId: string;
  title: string;
  slug: string;
  orderNumber: number;
  quarter?: Quarter;
}

export interface TopicProgress {
  completed: boolean;
  percent: number;
  earnedXP: number;
}

export interface TopicListItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  coverImage: string | null;
  durationMinutes: number;
  xpReward: number;
  simulationType: SimulationType;
  orderNumber: number;
  questionCount: number;
  section: { id: string; title: string; slug: string };
  quarter: { number: number; title: string };
  progress: TopicProgress;
}

export interface LessonVideo {
  youtubeId: string;
  embedUrl: string;
  title: string | null;
  description: string | null;
}

export interface LessonProgress {
  topicOpened: boolean;
  videoCompleted: boolean;
  simulationCompleted: boolean;
  quizCompleted: boolean;
  bestQuizScore: number;
  completed: boolean;
  percent: number;
  earnedXP: number;
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  formula: string | null;
  coverImage: string | null;
  keyConcepts: string[];
  durationMinutes: number;
  xpReward: number;
  simulationType: SimulationType;
  video: LessonVideo | null;
  objectives: string[];
  questionCount: number;
  section: { id: string; title: string; slug: string };
  quarter: { number: number; title: string };
  progress: LessonProgress | null;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options: { id: string; text: string }[];
}

export interface QuizResultItem {
  questionId: string;
  text: string;
  isCorrect: boolean;
  correctIds: string[];
  explanation: string | null;
}

export interface QuizResult {
  attemptId: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  grantedXP: number;
  results: QuizResultItem[];
  newAchievements: string[];
}

export interface ProgressResult {
  grantedXP: number;
  newAchievements: string[];
}

export interface LevelInfo {
  index: number;
  name: string;
  currentLevelMin: number;
  nextLevelMin: number | null;
  progressToNext: number;
}

export interface Profile {
  user: User;
  level: LevelInfo;
  stats: {
    completedTopics: number;
    avgQuizScore: number;
    quizAttempts: number;
    simulationsDone: number;
    achievementsUnlocked: number;
  };
}

export interface SectionProgress {
  id: string;
  title: string;
  quarter: number;
  total: number;
  completed: number;
  percent: number;
}

export interface ProfileProgress {
  sections: SectionProgress[];
  continueLearning: { title: string; slug: string; cover: string | null } | null;
  quizHistory: { topic: string; percentage: number; date: string }[];
}

export interface Achievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface ActivityDay {
  date: string;
  xp: number;
  actions: number;
}

// ── Admin ──────────────────────────────────────────────
export interface AdminDashboard {
  counts: { students: number; publishedTopics: number; videoCount: number; questionCount: number };
  avgQuizScore: number;
  topViewedTopics: { id: string; title: string; viewCount: number; slug: string }[];
  recentStudents: { id: string; fullName: string; email: string; grade: number; totalXP: number; createdAt: string }[];
}

export interface AdminTopic {
  id: string;
  sectionId: string;
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  formula: string | null;
  coverImage: string | null;
  youtubeUrl: string | null;
  videoTitle: string | null;
  videoDescription: string | null;
  keyConcepts: string[];
  durationMinutes: number;
  xpReward: number;
  simulationType: SimulationType;
  orderNumber: number;
  isPublished: boolean;
  section?: { title: string; quarter: { number: number } };
  _count?: { questions: number };
  objectives?: { id: string; text: string; order: number }[];
  questions?: AdminQuestion[];
}

export interface AdminQuestion {
  id: string;
  topicId: string;
  type: QuestionType;
  text: string;
  explanation: string | null;
  order: number;
  options: { id: string; text: string; isCorrect: boolean; order: number }[];
}

export interface AdminStudent {
  id: string;
  fullName: string;
  email: string;
  grade: number;
  totalXP: number;
  level: string;
  completedTopics: number;
  avgQuizScore: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors: { path?: string; message: string }[];
}
