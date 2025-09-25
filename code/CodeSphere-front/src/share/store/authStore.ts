import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  user_id: number;
  login_id: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;

  setAuth: (data: {
    accessToken?: string | null;
    refreshToken?: string | null;
    user?: User | null;
  }) => void;

  setAccessToken: (t: string | null) => void;
  setRefreshToken: (t: string | null) => void;
  setUser: (u: User | null) => void;

  clearAuth: () => void;

  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setAuth: ({ accessToken, refreshToken, user }) =>
        set((s) => ({
          accessToken: accessToken ?? s.accessToken,
          refreshToken: refreshToken ?? s.refreshToken,
          user: user ?? s.user,
        })),

      setAccessToken: (t) => set(() => ({ accessToken: t })),
      setRefreshToken: (t) => set(() => ({ refreshToken: t })),
      setUser: (u) => set(() => ({ user: u })),

      clearAuth: () =>
        set(() => ({ accessToken: null, refreshToken: null, user: null })),

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'auth',
      partialize: (s) => ({
        accessToken: s.accessToken,
        user: s.user,
        refreshToken: s.refreshToken,
      }),
      version: 2,
    },
  ),
);
