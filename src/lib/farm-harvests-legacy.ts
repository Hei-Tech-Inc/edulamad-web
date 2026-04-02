import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { fetchLegacyUnitsForFarm } from '@/lib/cages-redux-api';
import type { LegacyCageRow } from '@/lib/map-unit-to-legacy-cage';

/** Rows for `pages/harvest` table (Supabase-shaped accessors). */
export type LegacyHarvestListRow = {
  id: string;
  unitId: string;
  harvest_date: string;
  harvest_type: string;
  status: string;
  total_weight: number | null;
  cages: { name: string; code: string };
};

function normalizeHarvestList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === 'object' && 'items' in data) {
    const items = (data as { items?: unknown }).items;
    if (Array.isArray(items)) return items as Record<string, unknown>[];
  }
  return [];
}

function mapHarvestToLegacyRow(
  unit: LegacyCageRow,
  h: Record<string, unknown>,
): LegacyHarvestListRow {
  const harvestType = String(h.harvestType ?? '');
  const typeLabel = harvestType === 'full' ? 'complete' : 'partial';
  const dateRaw = h.harvestDate as string | undefined;
  const dateStr =
    dateRaw && dateRaw.length >= 10
      ? dateRaw.slice(0, 10)
      : dateRaw?.split('T')[0] ?? '';
  return {
    id: String(h.id ?? ''),
    unitId: unit.id,
    harvest_date: dateStr,
    harvest_type: typeLabel,
    status: String(h.status ?? 'recorded'),
    total_weight: h.totalWeightKg != null ? Number(h.totalWeightKg) : null,
    cages: { name: unit.name, code: unit.name },
  };
}

/**
 * All harvests for farm units, merged and sorted by harvest date (newest first).
 */
export async function fetchLegacyHarvestRowsForFarm(
  farmId: string,
  options?: {
    units?: LegacyCageRow[];
    limitPerUnit?: number;
    /** YYYY-MM-DD — passed to API when set */
    from?: string;
    to?: string;
  },
): Promise<LegacyHarvestListRow[]> {
  const limitPerUnit = options?.limitPerUnit ?? 80;
  const units =
    options?.units ??
    (await fetchLegacyUnitsForFarm(farmId, { limit: 500 })).legacy;

  const nested = await Promise.all(
    units.map(async (unit) => {
      try {
        const rows: LegacyHarvestListRow[] = [];
        for (let page = 1; ; page++) {
          const { data } = await apiClient.get(API.units.harvests(unit.id), {
            params: {
              limit: limitPerUnit,
              page,
              ...(options?.from ? { from: options.from } : {}),
              ...(options?.to ? { to: options.to } : {}),
            },
          });
          const batch = normalizeHarvestList(data);
          for (const h of batch) rows.push(mapHarvestToLegacyRow(unit, h));
          if (batch.length < limitPerUnit) break;
        }
        return rows;
      } catch {
        return [];
      }
    }),
  );

  const flat = nested.flat();
  flat.sort(
    (a, b) =>
      new Date(b.harvest_date).getTime() -
      new Date(a.harvest_date).getTime(),
  );
  return flat;
}
