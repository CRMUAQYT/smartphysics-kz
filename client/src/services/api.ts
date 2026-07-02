import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/store/auth';
import type { ApiError } from '@/types';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh on 401 (once)
let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiError>) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && original && !(original as { _retry?: boolean })._retry) {
      (original as { _retry?: boolean })._retry = true;
      try {
        if (!refreshing) {
          refreshing = useAuthStore
            .getState()
            .refresh()
            .finally(() => {
              refreshing = null;
            });
        }
        const newToken = await refreshing;
        if (newToken) {
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch {
        useAuthStore.getState().clear();
      }
    }
    return Promise.reject(error);
  },
);

/** Normalizes any thrown error into a friendly message. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.errors?.length) return data.errors[0].message;
    if (data?.message) return data.message;
    if (error.code === 'ERR_NETWORK') return 'Серверге қосылу мүмкін болмады';
  }
  return 'Белгісіз қате орын алды';
}

/** Resolves a possibly-relative upload URL against the API origin. */
export function resolveAsset(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_ORIGIN}${url}`;
}
