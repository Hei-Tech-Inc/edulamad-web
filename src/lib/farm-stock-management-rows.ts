import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { fetchLegacyUnitsForFarm } from '@/lib/cages-redux-api';
import type { LegacyCageRow } from '@/lib/map-unit-to-legacy-cage';
import { fetchAllStockCyclesForUnit } from '@/lib/unit-cycles-api';

/** Rows for `pages/stocking-management` (legacy stocking_history shape). */
export type LegacyStockManagementRow = {
  id: string;
  cage_id: string;
  cage: { id: string; name: string };
  batch_number: string;
  stocking_date: string;
  fish_count: number;
  initial_abw: number;
  initial_biomass: number;
  source_location: string | null;
  notes: string | null;
};

function cycleStockingDateYmd(c: Record<string, unknown>): string {
  const stockingRaw =
    (c.stockingDate as string | undefined) ??
    (c.stocking_date as string | undefined) ??
    '';
  if (stockingRaw.length >= 10) return stockingRaw.slice(0, 10);
  return stockingRaw.split('T')[0] ?? '';
}

function mapCycleToRow(
  unit: LegacyCageRow,
  c: Record<string, unknown>,
): LegacyStockManagementRow | null {
  const id = String(c.id ?? '');
  if (!id) return null;

  const count = Number(c.initialCount ?? c.initial_count ?? 0);
  const abw = Number(
    c.initialAvgWeightG ?? c.initial_avg_weight_g ?? c.initialAbw ?? 0,
  );
  const biomassKg =
    c.initialBiomassKg != null
      ? Number(c.initialBiomassKg)
      : count > 0 && abw > 0
        ? (count * abw) / 1000
        : 0;

  const batchNumber = String(
    (c.batchNumber as string | undefined) ??
      (c.batch_code as string | undefined) ??
      (id.length > 8 ? `${id.slice(0, 8)}…` : id),
  );

  const src =
    (c.sourceLocation as string | undefined) ??
    (c.source_location as string | undefined) ??
    null;
  const notesVal = (c.notes as string | undefined) ?? null;

  return {
    id,
    cage_id: unit.id,
    cage: { id: unit.id, name: unit.name },
    batch_number: batchNumber,
    stocking_date: cycleStockingDateYmd(c) || batchNumber,
    fish_count: count,
    initial_abw: abw,
    initial_biomass: biomassKg,
    source_location: src,
    notes: notesVal,
  };
}

export async function fetchLegacyStockManagementRowsForFarm(
  farmId: string,
  options?: { units?: LegacyCageRow[] },
): Promise<LegacyStockManagementRow[]> {
  const units =
    options?.units ??
    (await fetchLegacyUnitsForFarm(farmId, { limit: 500 })).legacy;

  const nested = await Promise.all(
    units.map(async (unit) => {
      try {
        const cycles = await fetchAllStockCyclesForUnit(unit.id);
        return cycles
          .map((c) => mapCycleToRow(unit, c))
          .filter((r): r is LegacyStockManagementRow => r != null);
      } catch {
        return [];
      }
    }),
  );

  const flat = nested.flat();
  flat.sort(
    (a, b) =>
      new Date(b.stocking_date).getTime() -
      new Date(a.stocking_date).getTime(),
  );
  return flat;
}

/** Updates metadata allowed by OpenAPI `UpdateStockCycleDto`. */
export async function patchStockCycleEditableFields(
  unitId: string,
  cycleId: string,
  body: { sourceLocation: string; notes: string },
): Promise<void> {
  await apiClient.patch(API.units.cycle(unitId, cycleId), {
    sourceLocation: body.sourceLocation.trim() || undefined,
    notes: body.notes.trim() || undefined,
  });
}
