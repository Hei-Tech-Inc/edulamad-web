import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import type { UnitListResponse, UnitStatus } from '@/api/types/unit.types';
import { mapUnitsToLegacyCages } from '@/lib/map-unit-to-legacy-cage';
import type { LegacyCageRow } from '@/lib/map-unit-to-legacy-cage';
import { mergeUnitSummaryIntoLegacy } from '@/lib/unit-summary-merge';

async function runPool<T>(
  items: T[],
  poolSize: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  const n = items.length;
  if (n === 0) return;
  const workers = Array.from(
    { length: Math.min(poolSize, n) },
    async () => {
      while (true) {
        const i = next++;
        if (i >= n) break;
        await fn(items[i]);
      }
    },
  );
  await Promise.all(workers);
}

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

/**
 * Merges `GET .../units/:id/summary` into legacy rows for operational metrics.
 * Only fetches for the first `maxUnits` rows matching `statuses` to limit traffic.
 */
export async function enrichLegacyUnitsWithSummaries(
  farmId: string,
  legacy: LegacyCageRow[],
  options: {
    maxUnits?: number;
    concurrency?: number;
    statuses?: string[];
  } = {},
): Promise<LegacyCageRow[]> {
  const {
    maxUnits = 30,
    concurrency = 5,
    statuses = ['active', 'ready_to_harvest'],
  } = options;
  const targets = legacy.filter((r) => statuses.includes(r.status)).slice(0, maxUnits);
  const byId = new Map<string, LegacyCageRow>();
  for (const r of legacy) {
    byId.set(r.id, { ...r });
  }

  await runPool(targets, concurrency, async (row) => {
    try {
      const { data } = await apiClient.get<unknown>(
        API.farms.unitSummary(farmId, row.id),
      );
      const cur = byId.get(row.id);
      if (cur) byId.set(row.id, mergeUnitSummaryIntoLegacy(cur, data));
    } catch {
      /* keep row as listed */
    }
  });

  return legacy.map((r) => byId.get(r.id) ?? r);
}
