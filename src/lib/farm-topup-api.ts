import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { fetchLegacyUnitsForFarm } from '@/lib/cages-redux-api';
import { normalizeStockCycleList } from '@/lib/unit-cycles-api';

export type ActiveCycleOption = {
  /** `unitId:cycleId` for form values */
  value: string;
  unitId: string;
  cycleId: string;
  batch_number: string;
  stocking_date: string;
  cage: { name: string };
  fish_count: number;
  initial_abw: number;
  initial_biomass: number;
};

export function parseCycleSelectValue(
  v: string,
): { unitId: string; cycleId: string } | null {
  const i = v.indexOf(':');
  if (i <= 0 || i === v.length - 1) return null;
  const unitId = v.slice(0, i);
  const cycleId = v.slice(i + 1);
  if (!unitId || !cycleId) return null;
  return { unitId, cycleId };
}

function ymd(d: unknown): string {
  const s = d == null ? '' : String(d);
  if (s.length >= 10) return s.slice(0, 10);
  return s.split('T')[0] ?? '';
}

function mapListItemToOption(
  unitId: string,
  cageName: string,
  c: Record<string, unknown>,
): ActiveCycleOption | null {
  const cycleId = String(c.id ?? '');
  if (!cycleId) return null;
  const count = Number(c.initialCount ?? c.initial_count ?? 0);
  const abw = Number(
    c.initialAvgWeightG ?? c.initial_avg_weight_g ?? c.initialAbw ?? 0,
  );
  const biomass =
    c.initialBiomassKg != null
      ? Number(c.initialBiomassKg)
      : count > 0 && abw > 0
        ? (count * abw) / 1000
        : 0;
  const batch_number = String(
    (c.batchNumber as string | undefined) ??
      (c.batch_code as string | undefined) ??
      (cycleId.length > 8 ? `${cycleId.slice(0, 8)}…` : cycleId),
  );
  return {
    value: `${unitId}:${cycleId}`,
    unitId,
    cycleId,
    batch_number,
    stocking_date: ymd(c.stockingDate ?? c.stocking_date),
    cage: { name: cageName },
    fish_count: count,
    initial_abw: abw,
    initial_biomass: biomass,
  };
}

/** Active stock cycles across farm units (for top-up picker). */
export async function fetchActiveStockCyclesForTopUp(
  farmId: string,
): Promise<ActiveCycleOption[]> {
  const { legacy: units } = await fetchLegacyUnitsForFarm(farmId, { limit: 500 });
  const nested = await Promise.all(
    units.map(async (u) => {
      try {
        const { data: raw } = await apiClient.get(API.units.cycles(u.id), {
          params: { status: 'active', limit: 25, page: 1 },
        });
        return normalizeStockCycleList(raw)
          .map((c) => mapListItemToOption(u.id, u.name, c))
          .filter((o): o is ActiveCycleOption => o != null);
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

export async function fetchStockCycleDetail(
  unitId: string,
  cycleId: string,
): Promise<Record<string, unknown>> {
  const { data } = await apiClient.get(API.units.cycle(unitId, cycleId));
  return (data ?? {}) as Record<string, unknown>;
}

export type SelectedStockingDisplay = {
  fish_count: number;
  initial_abw: number;
  initial_biomass: number;
  topups: unknown[];
};

export function mapCycleToSelectedStockingDisplay(
  c: Record<string, unknown>,
): SelectedStockingDisplay {
  const count = Number(c.initialCount ?? c.initial_count ?? 0);
  const abw = Number(
    c.initialAvgWeightG ?? c.initial_avg_weight_g ?? c.initialAbw ?? 0,
  );
  const biomass =
    c.initialBiomassKg != null
      ? Number(c.initialBiomassKg)
      : count > 0 && abw > 0
        ? (count * abw) / 1000
        : 0;
  return {
    fish_count: count,
    initial_abw: abw,
    initial_biomass: biomass,
    topups: [],
  };
}

export async function appendTopUpNoteToCycle(
  unitId: string,
  cycleId: string,
  block: string,
  extraPatch?: { sourceLocation?: string },
): Promise<void> {
  const prevCycle = await fetchStockCycleDetail(unitId, cycleId);
  const prev = String(prevCycle.notes ?? '').trim();
  const merged = prev ? `${prev}\n\n${block}` : block;
  await apiClient.patch(API.units.cycle(unitId, cycleId), {
    notes: merged,
    ...(extraPatch?.sourceLocation?.trim()
      ? { sourceLocation: extraPatch.sourceLocation.trim() }
      : {}),
  });
}

export function buildTopUpNoteBlock(params: {
  topup_date: string;
  fish_count: string | number;
  abw: string | number;
  biomassKg: number;
  source_location?: string;
  transfer_supervisor?: string;
  notes?: string;
}): string {
  const lines = [
    `--- Top-up ${params.topup_date} ---`,
    `Fish added: ${params.fish_count} @ ${params.abw} g ABW (~${params.biomassKg.toFixed(2)} kg biomass)`,
  ];
  if (params.source_location?.trim()) {
    lines.push(`Source: ${params.source_location.trim()}`);
  }
  if (params.transfer_supervisor?.trim()) {
    lines.push(`Transfer supervisor: ${params.transfer_supervisor.trim()}`);
  }
  if (params.notes?.trim()) {
    lines.push(`Notes: ${params.notes.trim()}`);
  }
  return lines.join('\n');
}
