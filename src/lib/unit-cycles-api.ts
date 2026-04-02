import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

export interface StockCycleRef {
  id: string;
  status?: string;
}

function normalizeCycles(body: unknown): StockCycleRef[] {
  if (Array.isArray(body)) {
    return body as StockCycleRef[];
  }
  const b = body as { items?: StockCycleRef[] } | null;
  if (b && Array.isArray(b.items)) return b.items;
  return [];
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
