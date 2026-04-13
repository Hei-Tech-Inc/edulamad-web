import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { isApiError } from '@/lib/api-error';

export function useExamCountdown(courseId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: courseId
      ? queryKeys.examCountdown.course(courseId)
      : ['exam-countdown', 'none'],
    enabled: Boolean(courseId && enabled),
    staleTime: 5 * 60_000,
    queryFn: async ({ signal }) => {
      if (!courseId) return null;
      const { data } = await apiClient.get<unknown>(API.examCountdown.byCourse(courseId), {
        signal,
      });
      return data;
    },
    retry: (count, err) => {
      if (isApiError(err) && (err.status === 404 || err.status === 403)) return false;
      return count < 2;
    },
  });
}
