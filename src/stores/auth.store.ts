import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Permission, RequestUser } from '@/api/types/common.types';

export interface AuthState {
  user: RequestUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: RequestUser) => void;
  clearAuth: () => void;
  hasPermission: (permission: Permission) => boolean;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      setTokens: (access, refresh) =>
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
        }),
      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      hasPermission: (permission) => {
        const u = get().user;
        if (!u?.permissions?.length) return false;
        return u.permissions.includes(permission);
      },
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'nsuo-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
);
