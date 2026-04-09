import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { isApiError } from '@/lib/api-error';

/**
 * GET /questions/:id — JWT + access rules (free unique views / credits).
 * On 403, `AppApiError.message` carries the server `ForbiddenException` text when provided.
 */
export function useQuestionDetail(questionId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: questionId ? queryKeys.questions.detail(questionId) : ['questions', 'detail', 'none'],
    enabled: Boolean(questionId && enabled),
    queryFn: async ({ signal }) => {
      if (!questionId) throw new Error('Missing question id');
      const { data } = await apiClient.get<unknown>(API.questions.detail(questionId), {
        signal,
      });
      return data;
    },
    staleTime: 60_000,
    retry: (count, err) => {
      if (isApiError(err) && (err.status === 403 || err.status === 404)) return false;
      return count < 2;
    },
  });
}
