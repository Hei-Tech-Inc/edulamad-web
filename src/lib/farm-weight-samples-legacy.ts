import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { fetchLegacyUnitsForFarm } from '@/lib/cages-redux-api';
import type { LegacyCageRow } from '@/lib/map-unit-to-legacy-cage';

/** Shape consumed by `pages/biweekly-records` (legacy biweekly / sampling table). */
export type LegacyBiweeklyRecordRow = {
  id: string;
  cage_id: string;
  date: string;
  cages?: { name?: string; code?: string };
  batch_code: string;
  total_fish_count: number;
  total_weight: number;
  average_body_weight: number;
  biweekly_sampling: Array<{
    id: string;
    sampling_number: number;
    fish_count: number;
    total_weight: number;
    average_body_weight: number;
  }>;
};

function sampleDateToYmd(sampledAt: string | undefined): string {
  const raw = sampledAt ?? '';
  if (raw.length >= 10) return raw.slice(0, 10);
  return raw.split('T')[0] ?? '';
}

function mapWeightSampleToLegacyRow(
  unit: LegacyCageRow,
  w: Record<string, unknown>,
): LegacyBiweeklyRecordRow {
  const id = String(w.id ?? '');
  const sampleSize = Number(w.sampleSize ?? 0);
  const avgG = Number(w.avgWeightG ?? 0);
  const totalWeightG = sampleSize * avgG;
  const cycleId = w.cycleId != null ? String(w.cycleId) : '';
  const batch_code =
    cycleId.length > 12 ? `${cycleId.slice(0, 8)}…` : cycleId || '—';
  const date = sampleDateToYmd(w.sampledAt as string | undefined);

  return {
    id,
    cage_id: unit.id,
    date,
    cages: { name: unit.name, code: unit.name },
    batch_code,
    total_fish_count: sampleSize,
    total_weight: totalWeightG,
    average_body_weight: avgG,
    biweekly_sampling:
      sampleSize > 0
        ? [
            {
              id: `${id}-agg`,
              sampling_number: 1,
              fish_count: sampleSize,
              total_weight: totalWeightG,
              average_body_weight: avgG,
            },
          ]
        : [],
  };
}

function normalizeWeightSampleList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === 'object' && 'items' in data) {
    const items = (data as { items?: unknown }).items;
    if (Array.isArray(items)) return items as Record<string, unknown>[];
  }
  return [];
}

/**
 * Farm-wide weight samples mapped to legacy biweekly rows (newest first).
 * One API list call per unit; caps list size per unit to control payload.
 * Pass `units` when callers already loaded legacy cages to avoid a second list-units request.
 */
export async function fetchLegacyBiweeklyRowsForFarm(
  farmId: string,
  options?: {
    unitsLimit?: number;
    samplesPerUnit?: number;
    units?: LegacyCageRow[];
  },
): Promise<LegacyBiweeklyRecordRow[]> {
  const unitsLimit = options?.unitsLimit ?? 500;
  const samplesPerUnit = options?.samplesPerUnit ?? 200;

  const units =
    options?.units ??
    (await fetchLegacyUnitsForFarm(farmId, { limit: unitsLimit })).legacy;

  const nested = await Promise.all(
    units.map(async (unit) => {
      try {
        const { data } = await apiClient.get(API.units.weightSamples(unit.id), {
          params: { limit: samplesPerUnit, page: 1 },
        });
        const rows = normalizeWeightSampleList(data);
        return rows.map((w) => mapWeightSampleToLegacyRow(unit, w));
      } catch {
        return [];
      }
    }),
  );

  const flat = nested.flat();
  flat.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return flat;
}
