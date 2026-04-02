import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type {
  WeightSampleDto,
  WeightSampleListResponse,
} from '@/api/types/unit-records.types';

function normalizeList(body: unknown): WeightSampleDto[] {
  if (Array.isArray(body)) {
    return body as WeightSampleDto[];
  }
  const b = body as WeightSampleListResponse | null;
  if (b && Array.isArray(b.items)) return b.items;
  return [];
}

export function useWeightSamples(
  unitId: string | null | undefined,
  filters?: { limit?: number; page?: number },
) {
  const keyFilters = { ...(filters ?? {}) };

  return useQuery({
    queryKey: queryKeys.weightSamples.list(unitId ?? '', keyFilters),
    queryFn: async () => {
      const { data: raw } = await apiClient.get<
        WeightSampleListResponse | WeightSampleDto[]
      >(API.units.weightSamples(unitId as string), { params: filters });
      return normalizeList(raw);
    },
    enabled: Boolean(unitId),
  });
}
