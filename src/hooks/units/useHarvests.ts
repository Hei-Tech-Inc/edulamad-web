import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type {
  HarvestListResponse,
  HarvestRecordDto,
} from '@/api/types/unit-records.types';

function normalizeList(body: unknown): HarvestRecordDto[] {
  if (Array.isArray(body)) {
    return body as HarvestRecordDto[];
  }
  const b = body as HarvestListResponse | null;
  if (b && Array.isArray(b.items)) return b.items;
  return [];
}

export function useHarvests(
  unitId: string | null | undefined,
  filters?: { limit?: number; page?: number; from?: string; to?: string },
) {
  const keyFilters = { ...(filters ?? {}) };

  return useQuery({
    queryKey: queryKeys.harvests.list(unitId ?? '', keyFilters),
    queryFn: async () => {
      const { data: raw } = await apiClient.get<
        HarvestListResponse | HarvestRecordDto[]
      >(API.units.harvests(unitId as string), { params: filters });
      return normalizeList(raw);
    },
    enabled: Boolean(unitId),
  });
}
