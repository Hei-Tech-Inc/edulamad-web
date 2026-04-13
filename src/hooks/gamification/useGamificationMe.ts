import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { isApiError } from '@/lib/api-error';

export function useGamificationMe() {
  return useQuery({
    queryKey: queryKeys.gamification.me,
    staleTime: 60_000,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.gamification.me, { signal });
      return data;
    },
    retry: (count, err) => {
      if (isApiError(err) && (err.status === 404 || err.status === 401)) return false;
      return count < 2;
    },
  });
}
