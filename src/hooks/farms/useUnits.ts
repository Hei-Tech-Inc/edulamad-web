import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type { UnitFilters, UnitListResponse } from '@/api/types/unit.types';

function normalizeUnitList(body: unknown): UnitListResponse {
  if (Array.isArray(body)) {
    return {
      items: body as UnitListResponse['items'],
      pagination: {
        page: 1,
        limit: body.length,
        total: body.length,
        pages: 1,
      },
    };
  }
  const b = body as UnitListResponse | null;
  if (b && Array.isArray(b.items)) return b;
  return {
    items: [],
    pagination: { page: 1, limit: 0, total: 0, pages: 0 },
  };
}

export function useUnits(
  farmId: string | null | undefined,
  filters?: UnitFilters,
) {
  const keyFilters = { farmId: farmId ?? '', ...(filters ?? {}) };

  return useQuery({
    queryKey: queryKeys.units.list(keyFilters),
    queryFn: async () => {
      const fid = farmId as string;
      const { data: raw } = await apiClient.get<UnitListResponse | unknown[]>(
        API.farms.units(fid),
        { params: filters },
      );
      return normalizeUnitList(raw);
    },
    enabled: Boolean(farmId),
  });
}
