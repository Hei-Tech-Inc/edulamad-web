import type { LegacyCageRow } from '@/lib/map-unit-to-legacy-cage';

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (
    typeof v === 'string' &&
    v.trim() !== '' &&
    Number.isFinite(Number(v))
  ) {
    return Number(v);
  }
  return null;
}

function pickFromRecord(
  obj: Record<string, unknown> | null,
  keys: string[],
): number | null {
  if (!obj) return null;
  for (const k of keys) {
    const n = num(obj[k]);
    if (n != null) return n;
  }
  return null;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

/** `GET /farms/:farmId/units/:id/summary` — response schema not fully detailed in OpenAPI; accept common shapes. */
export function mergeUnitSummaryIntoLegacy(
  row: LegacyCageRow,
  summary: unknown,
): LegacyCageRow {
  if (!summary || typeof summary !== 'object') return row;
  const s = summary as Record<string, unknown>;

  const cycle =
    asRecord(s.activeCycle) ??
    asRecord(s.cycle) ??
    asRecord(s.activeStockCycle);

  const initialFromCycle = cycle
    ? pickFromRecord(cycle, [
        'initialCount',
        'initial_count',
        'stockedCount',
        'stockingCount',
      ])
    : null;
  const initialFlat = pickFromRecord(s, [
    'initialCount',
    'initial_count',
    'stockedCount',
    'startingCount',
  ]);
  const initial_count = initialFromCycle ?? initialFlat ?? row.initial_count;

  const currentFromCycle = cycle
    ? pickFromRecord(cycle, [
        'currentCount',
        'current_count',
        'headcount',
        'estimatedCount',
      ])
    : null;
  const currentFlat = pickFromRecord(s, [
    'currentCount',
    'current_count',
    'estimatedCount',
    'headcount',
  ]);
  const current_count =
    currentFromCycle ?? currentFlat ?? row.current_count;

  const stockingRaw =
    (cycle && (cycle.stockingDate ?? cycle.stocking_date)) ??
    s.stockingDate ??
    s.stocking_date;
  const stocking_date =
    typeof stockingRaw === 'string'
      ? stockingRaw.slice(0, 10)
      : row.stocking_date;

  const initial_abw =
    pickFromRecord(cycle, ['initialAvgWeightG', 'initial_avg_weight_g']) ??
    pickFromRecord(s, ['initialAvgWeightG', 'initial_avg_weight_g']) ??
    row.initial_abw;

  const current_weight =
    pickFromRecord(s, [
      'currentAvgWeightG',
      'current_avg_weight_g',
      'averageWeightG',
      'avgWeightG',
      'meanWeightG',
    ]) ?? row.current_weight;

  const biomassKg =
    pickFromRecord(s, [
      'totalBiomassKg',
      'biomassKg',
      'estimatedBiomassKg',
      'biomass',
    ]) ?? null;

  const mortalityFlat = pickFromRecord(s, [
    'mortalityRate',
    'mortality_rate',
    'cumulativeMortalityRate',
  ]);

  return {
    ...row,
    initial_count,
    current_count,
    stocking_date: stocking_date || row.stocking_date,
    initial_abw,
    current_weight,
    mortality_rate: mortalityFlat ?? row.mortality_rate,
    summaryBiomassKg: biomassKg ?? row.summaryBiomassKg ?? null,
  };
}
