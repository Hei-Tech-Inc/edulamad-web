import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AuthOrgDto } from '@/api/types/auth.types';
import type { Permission, RequestUser } from '@/api/types/common.types';
import { queryClient } from '@/lib/query-client';

export interface AuthState {
  user: RequestUser | null;
  /** Set after register when the API returns `org`; cleared on login and sign-out. */
  org: AuthOrgDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /**
   * Platform super-admin: `X-Act-As-Org-Id` for tenant routes only (not `/platform/*`).
   * Session-only (excluded from persist).
   */
  actAsOrgId: string | null;
  actAsOrgLabel: string | null;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: RequestUser) => void;
  setOrg: (org: AuthOrgDto | null) => void;
  /** One-shot message after register if POST /farms failed (shown on dashboard, not persisted). */
  onboardingFarmNotice: string | null;
  setOnboardingFarmNotice: (msg: string | null) => void;
  setActAsOrg: (orgId: string | null, label?: string | null) => void;
  clearAuth: () => void;
  hasPermission: (permission: Permission) => boolean;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      org: null,
      onboardingFarmNotice: null,
      actAsOrgId: null,
      actAsOrgLabel: null,
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
      setOrg: (org) => set({ org }),
      setOnboardingFarmNotice: (msg) => set({ onboardingFarmNotice: msg }),
      setActAsOrg: (orgId, label) => {
        set({
          actAsOrgId: orgId,
          actAsOrgLabel: label ?? null,
        });
        void queryClient.invalidateQueries();
      },
      clearAuth: () =>
        set({
          user: null,
          org: null,
          onboardingFarmNotice: null,
          actAsOrgId: null,
          actAsOrgLabel: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      hasPermission: (permission) => {
        const u = get().user;
        if (u?.isPlatformSuperAdmin === true) return true;
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
        org: s.org,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
);
