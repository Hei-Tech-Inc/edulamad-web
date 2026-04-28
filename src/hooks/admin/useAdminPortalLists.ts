import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { pickArray } from '@/lib/admin/pick-array';

function asRows(data: unknown): Record<string, unknown>[] {
  return pickArray(data).map((r) =>
    r !== null && typeof r === 'object'
      ? (r as Record<string, unknown>)
      : { value: r as unknown },
  );
}

/** GET /admin/promo/codes */
export function useAdminPromoCodesList() {
  return useQuery({
    queryKey: ['admin', 'portal', 'promo-codes'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.admin.promo.codes, { signal });
      return asRows(data);
    },
    retry: false,
    staleTime: 30_000,
  });
}

/** GET /admin/content/manual-queue */
export function useAdminManualQueueList() {
  return useQuery({
    queryKey: ['admin', 'portal', 'manual-queue'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.admin.content.manualQueue, { signal });
      return asRows(data);
    },
    retry: false,
    staleTime: 30_000,
  });
}

/** GET /content/questions/pending-review */
export function useContentPendingReviewList() {
  return useQuery({
    queryKey: ['admin', 'portal', 'pending-review'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(
        API.content.questionsPendingReview,
        { signal },
      );
      return asRows(data);
    },
    retry: false,
    staleTime: 30_000,
  });
}

/** GET /quiz/history — typically scoped to the authenticated user; shown for staff convenience. */
export function useQuizHistoryList() {
  return useQuery({
    queryKey: ['admin', 'portal', 'quiz-history'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.quiz.history, { signal });
      return asRows(data);
    },
    retry: false,
    staleTime: 30_000,
  });
}

/** GET /discussions/recent */
export function useDiscussionsRecentList() {
  return useQuery({
    queryKey: ['admin', 'portal', 'discussions-recent'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.discussions.recent, { signal });
      return asRows(data);
    },
    retry: false,
    staleTime: 30_000,
  });
}

/** GET /gamification/leaderboard */
export function useGamificationLeaderboardList() {
  return useQuery({
    queryKey: ['admin', 'portal', 'leaderboard'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.gamification.leaderboard, { signal });
      return asRows(data);
    },
    retry: false,
    staleTime: 30_000,
  });
}

/** GET /ta/upload-queue */
export function useTaUploadQueueList() {
  return useQuery({
    queryKey: ['admin', 'portal', 'ta-upload-queue'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.ta.uploadQueue, { signal });
      return asRows(data);
    },
    retry: false,
    staleTime: 30_000,
  });
}

/** GET /questions/upload-queue */
export function useQuestionsUploadQueueList() {
  return useQuery({
    queryKey: ['admin', 'portal', 'questions-upload-queue'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.questions.uploadQueue, { signal });
      return asRows(data);
    },
    retry: false,
    staleTime: 30_000,
  });
}

/** GET /admin/notifications */
export function useAdminServerNotificationsList() {
  return useQuery({
    queryKey: ['admin', 'portal', 'server-notifications'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.admin.notifications, { signal });
      return asRows(data);
    },
    retry: false,
    staleTime: 30_000,
  });
}

/** GET /audit-logs */
export function useAuditLogsList() {
  return useQuery({
    queryKey: ['admin', 'portal', 'audit-logs'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.auditLogs.list, { signal });
      return asRows(data);
    },
    retry: false,
    staleTime: 30_000,
  });
}
