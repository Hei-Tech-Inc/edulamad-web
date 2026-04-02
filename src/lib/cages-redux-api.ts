import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import type { UnitListResponse, UnitStatus } from '@/api/types/unit.types';
import { mapUnitsToLegacyCages } from '@/lib/map-unit-to-legacy-cage';
import type { LegacyCageRow } from '@/lib/map-unit-to-legacy-cage';

function normalizeUnitList(body: unknown): UnitListResponse {
  if (Array.isArray(body)) {
    const arr = body as UnitListResponse['items'];
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
  const b = body as UnitListResponse | null;
  if (b && Array.isArray(b.items)) return b;
  return {
    items: [],
    pagination: { page: 1, limit: 0, total: 0, pages: 0 },
  };
}

export async function fetchLegacyUnitsForFarm(
  farmId: string,
  params: {
    page?: number;
    limit?: number;
    status?: UnitStatus;
  } = {},
): Promise<{
  legacy: LegacyCageRow[];
  total: number;
  pages: number;
}> {
  const { data: raw } = await apiClient.get<UnitListResponse | unknown[]>(
    API.farms.units(farmId),
    { params },
  );
  const normalized = normalizeUnitList(raw);
  const legacy = mapUnitsToLegacyCages(normalized.items, farmId);
  return {
    legacy,
    total: normalized.pagination.total,
    pages: normalized.pagination.pages,
  };
}
