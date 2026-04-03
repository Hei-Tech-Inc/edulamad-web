import type { FarmFilters } from '@/api/types/farm.types';

export const queryKeys = {
  farms: {
    all: ['farms'] as const,
    lists: () => [...queryKeys.farms.all, 'list'] as const,
    list: (filters: FarmFilters) =>
      [...queryKeys.farms.lists(), filters] as const,
    details: () => [...queryKeys.farms.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.farms.details(), id] as const,
    summary: (id: string) => [...queryKeys.farms.all, 'summary', id] as const,
  },
  units: {
    all: ['units'] as const,
    lists: () => [...queryKeys.units.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.units.lists(), filters] as const,
    details: () => [...queryKeys.units.all, 'detail'] as const,
    detail: (farmId: string, id: string) =>
      [...queryKeys.units.details(), farmId, id] as const,
    summary: (farmId: string, id: string) =>
      [...queryKeys.units.all, 'summary', farmId, id] as const,
  },
  cycles: {
    all: ['cycles'] as const,
    byUnit: (unitId: string) => [...queryKeys.cycles.all, unitId] as const,
    list: (unitId: string, filters: Record<string, unknown>) =>
      [...queryKeys.cycles.byUnit(unitId), 'list', filters] as const,
    detail: (unitId: string, id: string) =>
      [...queryKeys.cycles.byUnit(unitId), 'detail', id] as const,
  },
  dailyRecords: {
    all: ['daily-records'] as const,
    byUnit: (unitId: string) =>
      [...queryKeys.dailyRecords.all, unitId] as const,
    list: (unitId: string, filters: Record<string, unknown>) =>
      [...queryKeys.dailyRecords.byUnit(unitId), 'list', filters] as const,
  },
  weightSamples: {
    all: ['weight-samples'] as const,
    byUnit: (unitId: string) =>
      [...queryKeys.weightSamples.all, unitId] as const,
    list: (unitId: string, filters: Record<string, unknown>) =>
      [...queryKeys.weightSamples.byUnit(unitId), 'list', filters] as const,
  },
  feedingLogs: {
    all: ['feeding-logs'] as const,
    byUnit: (unitId: string) =>
      [...queryKeys.feedingLogs.all, unitId] as const,
  },
  harvests: {
    all: ['harvests'] as const,
    byUnit: (unitId: string) => [...queryKeys.harvests.all, unitId] as const,
    list: (unitId: string, filters: Record<string, unknown>) =>
      [...queryKeys.harvests.byUnit(unitId), 'list', filters] as const,
  },
  feed: {
    all: ['feed'] as const,
    suppliers: {
      all: () => [...queryKeys.feed.all, 'suppliers'] as const,
      lists: () => [...queryKeys.feed.suppliers.all(), 'list'] as const,
      list: (filters: Record<string, unknown>) =>
        [...queryKeys.feed.suppliers.lists(), filters] as const,
      detail: (id: string) =>
        [...queryKeys.feed.suppliers.all(), 'detail', id] as const,
    },
    types: {
      all: () => [...queryKeys.feed.all, 'types'] as const,
      lists: () => [...queryKeys.feed.types.all(), 'list'] as const,
      list: (filters: Record<string, unknown>) =>
        [...queryKeys.feed.types.lists(), filters] as const,
      detail: (id: string) =>
        [...queryKeys.feed.types.all(), 'detail', id] as const,
      lowStock: () =>
        [...queryKeys.feed.types.all(), 'low-stock'] as const,
    },
    purchases: {
      all: () => [...queryKeys.feed.all, 'purchases'] as const,
      lists: () => [...queryKeys.feed.purchases.all(), 'list'] as const,
      list: (filters: Record<string, unknown>) =>
        [...queryKeys.feed.purchases.lists(), filters] as const,
      detail: (id: string) =>
        [...queryKeys.feed.purchases.all(), 'detail', id] as const,
      summary: (filters: Record<string, unknown>) =>
        [...queryKeys.feed.purchases.all(), 'summary', filters] as const,
    },
    inventory: {
      all: () => [...queryKeys.feed.all, 'inventory'] as const,
      transactions: (filters: Record<string, unknown>) =>
        [...queryKeys.feed.inventory.all(), 'transactions', filters] as const,
    },
  },
  analytics: {
    overview: ['analytics', 'overview'] as const,
    growthTrends: (pondId: string) =>
      ['analytics', 'growth', pondId] as const,
    harvestReadiness: ['analytics', 'readiness'] as const,
    mortalityTrends: (filters: Record<string, unknown>) =>
      ['analytics', 'mortality', filters] as const,
    feedEfficiency: ['analytics', 'feed-efficiency'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
  apiKeys: {
    all: ['api-keys'] as const,
    list: () => [...queryKeys.apiKeys.all, 'list'] as const,
  },
  platform: {
    all: ['platform'] as const,
    organisations: (filters: Record<string, unknown>) =>
      [...queryKeys.platform.all, 'organisations', filters] as const,
    organisation: (
      orgId: string,
      opts?: { includeDeleted?: boolean },
    ) =>
      [
        ...queryKeys.platform.all,
        'organisation',
        orgId,
        opts?.includeDeleted === true ? 'withDeleted' : 'default',
      ] as const,
  },
} as const;
