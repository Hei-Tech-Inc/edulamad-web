import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type { Unit } from '@/api/types/unit.types';

export function useUnit(
  farmId: string | null | undefined,
  unitId: string | null | undefined,
) {
  return useQuery({
    queryKey: queryKeys.units.detail(farmId ?? '', unitId ?? ''),
    queryFn: async () => {
      const { data } = await apiClient.get<Unit>(
        API.farms.unit(farmId as string, unitId as string),
      );
      return data;
    },
    enabled: Boolean(farmId && unitId),
  });
}
