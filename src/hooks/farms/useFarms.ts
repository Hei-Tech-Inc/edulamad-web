import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type { FarmFilters, FarmListResponse } from '@/api/types/farm.types';

export function useFarms(filters?: FarmFilters) {
  return useQuery({
    queryKey: queryKeys.farms.list(filters ?? {}),
    queryFn: async () => {
      const { data } = await apiClient.get<FarmListResponse>(API.farms.list, {
        params: filters,
      });
      return data;
    },
  });
}
