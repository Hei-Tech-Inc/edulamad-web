import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
export { useStudentProfile } from '@/hooks/students/useStudentProfile';

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function pickNumber(obj: Record<string, unknown> | null, keys: string[]): number | null {
  if (!obj) return null;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return null;
}

function pickString(obj: Record<string, unknown> | null, keys: string[]): string | null {
  if (!obj) return null;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return null;
}

function pickArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  const obj = asRecord(v);
  if (!obj) return [];
  const keys = ['items', 'rows', 'data', 'notifications'];
  for (const key of keys) {
    const value = obj[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

export function useAuthMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.auth.me, { signal });
      return asRecord(data);
    },
  });
}

export function useStudentStreak() {
  return useQuery({
    queryKey: ['students', 'streak'] as const,
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.students.meStreak, { signal });
      const obj = asRecord(data);
      return pickNumber(obj, ['streak', 'currentStreak', 'days']);
    },
  });
}

export function useStudentXp() {
  return useQuery({
    queryKey: ['students', 'xp'] as const,
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.students.meXp, { signal });
      const obj = asRecord(data);
      return pickNumber(obj, ['xp', 'totalXp', 'points']);
    },
  });
}

export function useAnalyticsMe() {
  return useQuery({
    queryKey: ['analytics', 'me'] as const,
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.analytics.me, { signal });
      return asRecord(data);
    },
  });
}

export function useAdminStats(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'stats'] as const,
    enabled,
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.admin.stats, { signal });
      return asRecord(data);
    },
  });
}

export type DashboardNotification = {
  id: string;
  title: string;
  createdAt?: string;
};

export function useMyNotifications(limit = 5) {
  return useQuery({
    queryKey: ['notifications', 'me', { limit }] as const,
    retry: false,
    queryFn: async ({ signal }): Promise<DashboardNotification[]> => {
      const { data } = await apiClient.get<unknown>(API.notifications.me, { signal });
      return pickArray(data)
        .flatMap((row): DashboardNotification[] => {
          const obj = asRecord(row);
          if (!obj) return [];
          const id = pickString(obj, ['id', '_id', 'uuid']);
          const title = pickString(obj, ['title', 'message', 'body']);
          if (!id || !title) return [];
          return [
            {
              id,
              title,
              createdAt:
                pickString(obj, ['createdAt', 'created_at', 'timestamp']) || undefined,
            },
          ];
        })
        .slice(0, limit);
    },
  });
}
