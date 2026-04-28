import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.admin.stats, { signal });
      return data;
    },
    staleTime: 60_000,
  });
}
