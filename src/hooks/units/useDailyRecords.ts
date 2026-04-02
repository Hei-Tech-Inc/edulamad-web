import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type {
  DailyRecordDto,
  DailyRecordListResponse,
} from '@/api/types/unit-records.types';

function normalizeDailyList(body: unknown): DailyRecordDto[] {
  if (Array.isArray(body)) {
    return body as DailyRecordDto[];
  }
  const b = body as DailyRecordListResponse | null;
  if (b && Array.isArray(b.items)) return b.items;
  return [];
}

export function useDailyRecords(
  unitId: string | null | undefined,
  filters?: { limit?: number; from?: string; to?: string; page?: number },
) {
  const keyFilters = { ...(filters ?? {}) };

  return useQuery({
    queryKey: queryKeys.dailyRecords.list(unitId ?? '', keyFilters),
    queryFn: async () => {
      const { data: raw } = await apiClient.get<
        DailyRecordListResponse | DailyRecordDto[]
      >(API.units.dailyRecords(unitId as string), { params: filters });
      return normalizeDailyList(raw);
    },
    enabled: Boolean(unitId),
  });
}
