import { api } from './api';
import type {
  Achievement,
  ActivityDay,
  AdminDashboard,
  AdminQuestion,
  AdminStudent,
  AdminTopic,
  AuthResponse,
  Lesson,
  Profile,
  ProfileProgress,
  ProgressResult,
  Quarter,
  QuizQuestion,
  QuizResult,
  Section,
  TopicListItem,
  User,
} from '@/types';

type Envelope<T> = { success: boolean; data: T };
const unwrap = <T>(p: Promise<{ data: Envelope<T> }>) => p.then((r) => r.data.data);

/** Payload for creating/updating a topic (objectives are plain strings here). */
export type TopicInput = Omit<Partial<AdminTopic>, 'objectives' | 'questions' | 'section' | '_count'> & {
  objectives?: string[];
};

// ── Auth ───────────────────────────────────────────────
export const authApi = {
  register: (body: { fullName: string; email: string; password: string; grade: number; avatar: string }) =>
    unwrap<AuthResponse>(api.post('/auth/register', body)),
  login: (body: { email: string; password: string }) =>
    unwrap<AuthResponse>(api.post('/auth/login', body)),
  logout: () => api.post('/auth/logout'),
  me: () => unwrap<User>(api.get('/auth/me')),
};

// ── Catalog ────────────────────────────────────────────
export const catalogApi = {
  quarters: () => unwrap<Quarter[]>(api.get('/quarters')),
  sections: () => unwrap<Section[]>(api.get('/sections')),
  topics: (params?: { quarter?: number; sectionId?: string; search?: string; status?: string }) =>
    unwrap<TopicListItem[]>(api.get('/topics', { params })),
  topic: (slug: string) => unwrap<Lesson>(api.get(`/topics/${slug}`)),
};

// ── Progress ───────────────────────────────────────────
export const progressApi = {
  open: (id: string) => unwrap<ProgressResult>(api.post(`/topics/${id}/open`)),
  videoComplete: (id: string) => unwrap<ProgressResult>(api.post(`/topics/${id}/video-complete`)),
  simulationComplete: (id: string, params?: Record<string, unknown>) =>
    unwrap<ProgressResult>(api.post(`/topics/${id}/simulation-complete`, { params })),
};

// ── Quiz ───────────────────────────────────────────────
export const quizApi = {
  questions: (id: string) => unwrap<QuizQuestion[]>(api.get(`/topics/${id}/questions`)),
  submit: (id: string, answers: { questionId: string; selectedIds: string[] }[]) =>
    unwrap<QuizResult>(api.post(`/topics/${id}/quiz-attempts`, { answers })),
};

// ── Profile ────────────────────────────────────────────
export const profileApi = {
  get: () => unwrap<Profile>(api.get('/profile')),
  progress: () => unwrap<ProfileProgress>(api.get('/profile/progress')),
  achievements: () => unwrap<Achievement[]>(api.get('/profile/achievements')),
  activity: () => unwrap<ActivityDay[]>(api.get('/profile/activity')),
};

// ── Admin ──────────────────────────────────────────────
export const adminApi = {
  dashboard: () => unwrap<AdminDashboard>(api.get('/admin/dashboard')),
  topics: () => unwrap<AdminTopic[]>(api.get('/admin/topics')),
  topic: (id: string) => unwrap<AdminTopic>(api.get(`/admin/topics/${id}`)),
  createTopic: (body: TopicInput) => unwrap<AdminTopic>(api.post('/admin/topics', body)),
  updateTopic: (id: string, body: TopicInput) => unwrap<AdminTopic>(api.patch(`/admin/topics/${id}`, body)),
  deleteTopic: (id: string) => unwrap<{ id: string }>(api.delete(`/admin/topics/${id}`)),
  createQuestion: (body: {
    topicId: string;
    type: string;
    text: string;
    explanation?: string | null;
    options: { text: string; isCorrect: boolean }[];
  }) => unwrap<AdminQuestion>(api.post('/admin/questions', body)),
  updateQuestion: (id: string, body: Record<string, unknown>) =>
    unwrap<AdminQuestion>(api.patch(`/admin/questions/${id}`, body)),
  deleteQuestion: (id: string) => unwrap<{ id: string }>(api.delete(`/admin/questions/${id}`)),
  students: () => unwrap<AdminStudent[]>(api.get('/admin/students')),
  student: (id: string) => unwrap<Record<string, unknown>>(api.get(`/admin/students/${id}`)),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return unwrap<{ url: string; id: string }>(
      api.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
    );
  },
};
