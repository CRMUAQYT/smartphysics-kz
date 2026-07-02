import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import type { AuthResponse, User } from '@/types';
import { API_URL } from '@/services/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (data: AuthResponse) => void;
  setUser: (user: User) => void;
  clear: () => void;
  refresh: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (data) =>
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        }),

      setUser: (user) => set({ user }),

      clear: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),

      // Uses a bare axios call to avoid the interceptor recursion.
      // Sends the refresh token in the body (works cross-domain where third-party
      // cookies are blocked) while still sending the cookie for same-origin setups.
      refresh: async () => {
        try {
          const res = await axios.post<{ success: boolean; data: AuthResponse }>(
            `${API_URL}/auth/refresh`,
            { refreshToken: get().refreshToken ?? undefined },
            { withCredentials: true },
          );
          const data = res.data.data;
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
          });
          return data.accessToken;
        } catch {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
          return null;
        }
      },
    }),
    {
      name: 'smartphysics-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export function isAdmin(): boolean {
  return useAuthStore.getState().user?.role === 'ADMIN';
}
