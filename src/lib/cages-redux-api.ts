import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import type { UnitListResponse, UnitStatus } from '@/api/types/unit.types';
import { mapUnitsToLegacyCages } from '@/lib/map-unit-to-legacy-cage';
import type { LegacyCageRow } from '@/lib/map-unit-to-legacy-cage';
import { mergeUnitSummaryIntoLegacy } from '@/lib/unit-summary-merge';

/**
 * Per-request cap for GET /farms/:id/units. Backend validators often reject
 * large `limit` (e.g. 500) with 422; fetch aggregates across pages when needed.
 */
export const UNITS_MAX_LIMIT_PER_REQUEST = 100;

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

function listUnitsParams(
  page: number,
  limit: number,
  status: UnitStatus | undefined,
): Record<string, string | number> {
  const q: Record<string, string | number> = {
    page,
    limit: Math.min(Math.max(1, limit), UNITS_MAX_LIMIT_PER_REQUEST),
  };
  if (status !== undefined) q.status = status;
  return q;
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
  const status = params.status;
  const explicitPage = params.page !== undefined;
  const page = explicitPage ? Math.max(1, params.page ?? 1) : 1;
  const requestedLimit = params.limit ?? 20;

  if (explicitPage) {
    const { data: raw } = await apiClient.get<UnitListResponse | unknown[]>(
      API.farms.units(farmId),
      { params: listUnitsParams(page, requestedLimit, status) },
    );
    const normalized = normalizeUnitList(raw);
    const legacy = mapUnitsToLegacyCages(normalized.items, farmId);
    return {
      legacy,
      total: normalized.pagination.total,
      pages: normalized.pagination.pages,
    };
  }

  const all: LegacyCageRow[] = [];
  let total = 0;
  let pages = 1;
  let currentPage = 1;

  while (all.length < requestedLimit) {
    const remaining = requestedLimit - all.length;
    const batchLimit = Math.min(UNITS_MAX_LIMIT_PER_REQUEST, remaining);
    const { data: raw } = await apiClient.get<UnitListResponse | unknown[]>(
      API.farms.units(farmId),
      { params: listUnitsParams(currentPage, batchLimit, status) },
    );
    const normalized = normalizeUnitList(raw);
    total = normalized.pagination.total;
    pages = Math.max(1, normalized.pagination.pages);
    const batch = mapUnitsToLegacyCages(normalized.items, farmId);
    all.push(...batch);
    if (batch.length === 0 || currentPage >= pages || all.length >= requestedLimit) {
      break;
    }
    currentPage += 1;
  }

  return {
    legacy: all.slice(0, requestedLimit),
    total,
    pages,
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
