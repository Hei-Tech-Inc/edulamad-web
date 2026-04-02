import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

export interface StockCycleRef {
  id: string;
  status?: string;
}

const CYCLE_PAGE_SIZE = 100;

/** Normalized list items from GET /units/:unitId/cycles (array or paginated envelope). */
export function normalizeStockCycleList(body: unknown): Record<string, unknown>[] {
  if (Array.isArray(body)) return body as Record<string, unknown>[];
  if (body && typeof body === 'object' && 'items' in body) {
    const items = (body as { items?: unknown }).items;
    if (Array.isArray(items)) return items as Record<string, unknown>[];
  }
  return [];
}

function normalizeCycles(body: unknown): StockCycleRef[] {
  return normalizeStockCycleList(body) as unknown as StockCycleRef[];
}

/** All stock cycles for a unit (paginated server-side until exhausted). */
export async function fetchAllStockCyclesForUnit(
  unitId: string,
): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  for (let page = 1; ; page++) {
    const { data: raw } = await apiClient.get(API.units.cycles(unitId), {
      params: { limit: CYCLE_PAGE_SIZE, page },
    });
    const batch = normalizeStockCycleList(raw);
    all.push(...batch);
    if (batch.length < CYCLE_PAGE_SIZE) break;
  }
  return all;
}

/** First active (or most recently listed) cycle for daily-record `cycleId`. */
export async function fetchActiveCycleIdForUnit(
  unitId: string,
): Promise<string | null> {
  const { data: raw } = await apiClient.get(API.units.cycles(unitId), {
    params: { status: 'active', limit: 20 },
  });
  const items = normalizeCycles(raw);
  const active = items.find((c) => c.status === 'active');
  return active?.id ?? items[0]?.id ?? null;
}
