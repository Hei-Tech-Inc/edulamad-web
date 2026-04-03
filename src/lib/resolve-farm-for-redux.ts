import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { normalizeFarmListBody } from '@/hooks/farms/useFarms';
import { useUiStore } from '@/stores/ui.store';

/** Ensures Redux cage thunks have a farm id (persisted UI store or first farm). */
export async function resolveFarmIdForRedux(): Promise<string | null> {
  const existing = useUiStore.getState().activeFarmId;
  if (existing) return existing;

  try {
    const { data } = await apiClient.get(API.farms.list, { params: { limit: 100 } });
    const { items } = normalizeFarmListBody(data);
    const first = items[0];
    if (first?.id) {
      useUiStore.getState().setActiveFarmId(first.id);
      return first.id;
    }
    return null;
  } catch {
    return null;
  }
}
