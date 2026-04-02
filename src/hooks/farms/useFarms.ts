import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type { Farm, FarmFilters, FarmListResponse } from '@/api/types/farm.types';

export function normalizeFarmListBody(body: unknown): FarmListResponse {
  if (Array.isArray(body)) {
    const arr = body as Farm[];
    return {
      items: arr,
      pagination: {
        page: 1,
        limit: arr.length,
        total: arr.length,
        pages: 1,
      },
    };
  }
  const b = body as FarmListResponse | null;
  if (b && Array.isArray(b.items)) return b;
  return {
    items: [],
    pagination: { page: 1, limit: 0, total: 0, pages: 0 },
  };
}

export function useFarms(filters?: FarmFilters) {
  return useQuery({
    queryKey: queryKeys.farms.list(filters ?? {}),
    queryFn: async () => {
      const { data: raw } = await apiClient.get<FarmListResponse | unknown[]>(
        API.farms.list,
        {
          params: filters,
        },
      );
      return normalizeFarmListBody(raw);
    },
  });
}
