import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { isApiError } from '@/lib/api-error';

export type DiscussionMessageRow = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: number | string;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function pickArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  const r = asRecord(v);
  if (!r) return [];
  for (const k of ['messages', 'items', 'data', 'rows']) {
    if (Array.isArray(r[k])) return r[k] as unknown[];
  }
  return [];
}

function normalizeThread(raw: unknown): DiscussionMessageRow[] {
  return pickArray(raw).flatMap((row): DiscussionMessageRow[] => {
    const rec = asRecord(row);
    if (!rec) return [];
    const id =
      typeof rec._id === 'string'
        ? rec._id
        : typeof rec.id === 'string'
          ? rec.id
          : '';
    const roleRaw = rec.role;
    const role =
      roleRaw === 'assistant' || roleRaw === 'system' || roleRaw === 'user'
        ? roleRaw
        : 'user';
    const content =
      typeof rec.content === 'string'
        ? rec.content
        : typeof rec.message === 'string'
          ? rec.message
          : '';
    if (!id || !content.trim()) return [];
    return [{ id, role, content: content.trim(), createdAt: rec._creationTime as number | undefined }];
  });
}

export function useDiscussionThread(questionId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: questionId
      ? queryKeys.discussions.thread(questionId)
      : ['discussions', 'thread', 'none'],
    enabled: Boolean(questionId && enabled),
    queryFn: async ({ signal }) => {
      if (!questionId) return [];
      const { data } = await apiClient.get<unknown>(API.discussions.threads(questionId), {
        signal,
      });
      return normalizeThread(data);
    },
    staleTime: 15_000,
    retry: (count, err) => {
      if (isApiError(err) && (err.status === 403 || err.status === 404)) return false;
      return count < 2;
    },
  });
}

export function useSendDiscussionMessage(questionId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      if (!questionId) throw new Error('Missing question id');
      await apiClient.post(API.discussions.messages, {
        questionId,
        role: 'user',
        content: message.trim(),
        isQuestion: false,
      });
    },
    onSuccess: () => {
      if (questionId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.discussions.thread(questionId),
        });
      }
    },
  });
}

export function useClearDiscussionThread(questionId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!questionId) throw new Error('Missing question id');
      await apiClient.delete(API.discussions.threads(questionId));
    },
    onSuccess: () => {
      if (questionId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.discussions.thread(questionId),
        });
      }
    },
  });
}

export function useRecentDiscussions(limit = 10) {
  return useQuery({
    queryKey: queryKeys.discussions.recent(limit),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.discussions.recent, {
        signal,
        params: { limit },
      });
      return pickArray(data);
    },
    staleTime: 60_000,
  });
}
