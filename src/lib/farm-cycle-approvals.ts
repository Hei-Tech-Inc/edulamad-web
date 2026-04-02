import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { fetchLegacyUnitsForFarm } from '@/lib/cages-redux-api';
import type { LegacyCageRow } from '@/lib/map-unit-to-legacy-cage';

const PAGE_SIZE = 100;

function normalizeCycleList(body: unknown): Record<string, unknown>[] {
  if (Array.isArray(body)) return body as Record<string, unknown>[];
  if (body && typeof body === 'object' && 'items' in body) {
    const items = (body as { items?: unknown }).items;
    if (Array.isArray(items)) return items as Record<string, unknown>[];
  }
  return [];
}

function isPendingCycle(c: Record<string, unknown>): boolean {
  const s = String(c.status ?? '').toLowerCase();
  if (
    [
      'pending',
      'pending_approval',
      'awaiting_approval',
      'draft',
      'submitted',
    ].includes(s)
  ) {
    return true;
  }
  if (c.approved === false) return true;
  if (c.approvalStatus != null) {
    const a = String(c.approvalStatus).toLowerCase();
    if (a === 'pending' || a === 'required' || a === 'awaiting') return true;
  }
  if (c.isApproved === false) return true;
  return false;
}

async function fetchAllCyclesForUnit(
  unitId: string,
): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  for (let page = 1; ; page++) {
    const { data: raw } = await apiClient.get(API.units.cycles(unitId), {
      params: { limit: PAGE_SIZE, page },
    });
    const batch = normalizeCycleList(raw);
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return all;
}

/** Table row shape matches legacy `stockingService.getPendingApprovals` stocking entries. */
export type PendingCycleApprovalRow = {
  type: 'stocking';
  id: string;
  unitId: string;
  date: string;
  batchNumber: string;
  cageName: string;
  cageId: string;
  count: number;
  abw: number;
  biomass: number;
  createdAt: string;
  createdBy: string;
};

function mapCycleToRow(
  unit: LegacyCageRow,
  c: Record<string, unknown>,
): PendingCycleApprovalRow | null {
  if (!isPendingCycle(c)) return null;
  const id = String(c.id ?? '');
  if (!id) return null;

  const stockingRaw =
    (c.stockingDate as string | undefined) ??
    (c.stocking_date as string | undefined) ??
    '';
  const dateStr =
    stockingRaw.length >= 10
      ? stockingRaw.slice(0, 10)
      : (stockingRaw.split('T')[0] ?? '');

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

  const createdRaw =
    (c.createdAt as string | undefined) ??
    (c.created_at as string | undefined) ??
    stockingRaw;
  const createdBy = String(
    (c.createdBy as string | undefined) ??
      (c.created_by as string | undefined) ??
      '',
  );

  const batchNumber = String(
    (c.batchNumber as string | undefined) ??
      (c.batch_code as string | undefined) ??
      (id.length > 8 ? `${id.slice(0, 8)}…` : id),
  );

  return {
    type: 'stocking',
    id,
    unitId: unit.id,
    date: dateStr || createdRaw.slice(0, 10),
    batchNumber,
    cageName: unit.name,
    cageId: unit.id,
    count,
    abw,
    biomass: biomassKg,
    createdAt: createdRaw || dateStr,
    createdBy,
  };
}

export type PendingApprovalsBundle = {
  all: PendingCycleApprovalRow[];
  stockings: PendingCycleApprovalRow[];
  topups: never[];
};

export async function fetchPendingStockCycleApprovals(
  farmId: string,
  options?: { units?: LegacyCageRow[] },
): Promise<PendingApprovalsBundle> {
  const units =
    options?.units ??
    (await fetchLegacyUnitsForFarm(farmId, { limit: 500 })).legacy;

  const nested = await Promise.all(
    units.map(async (unit) => {
      try {
        const cycles = await fetchAllCyclesForUnit(unit.id);
        return cycles
          .map((c) => mapCycleToRow(unit, c))
          .filter((r): r is PendingCycleApprovalRow => r != null);
      } catch {
        return [];
      }
    }),
  );

  const stockings = nested.flat();
  stockings.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    stockings,
    topups: [],
    all: stockings,
  };
}

export async function approveStockCycle(
  unitId: string,
  cycleId: string,
): Promise<void> {
  await apiClient.patch(API.units.cycleApprove(unitId, cycleId));
}
