import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import {
  fetchLegacyHarvestRowsForFarm,
  type LegacyHarvestListRow,
} from '@/lib/farm-harvests-legacy';
import {
  fetchLegacyBiweeklyRowsForFarm,
  type LegacyBiweeklyRecordRow,
} from '@/lib/farm-weight-samples-legacy';
import { fetchLegacyUnitsForFarm } from '@/lib/cages-redux-api';
import { normalizeDailyRecordList } from '@/hooks/units/useDailyRecords';

const DAILY_PAGE_SIZE = 100;

async function fetchDailyExportRowsForFarm(
  farmId: string,
  from: string,
  to: string,
): Promise<Record<string, unknown>[]> {
  const { legacy: units } = await fetchLegacyUnitsForFarm(farmId, { limit: 500 });
  const rows: Record<string, unknown>[] = [];

  for (const u of units) {
    for (let page = 1; ; page++) {
      const { data: raw } = await apiClient.get(API.units.dailyRecords(u.id), {
        params: { from, to, limit: DAILY_PAGE_SIZE, page },
      });
      const items = normalizeDailyRecordList(raw);
      for (const r of items) {
        rows.push({ ...r, unitId: u.id, unitName: u.name });
      }
      if (items.length < DAILY_PAGE_SIZE) break;
    }
  }

  return rows;
}

function flattenBiweeklyForExport(r: LegacyBiweeklyRecordRow) {
  return {
    id: r.id,
    cage_id: r.cage_id,
    cage_name: r.cages?.name ?? '',
    date: r.date,
    batch_code: r.batch_code,
    total_fish_count: r.total_fish_count,
    total_weight: r.total_weight,
    average_body_weight: r.average_body_weight,
  };
}

function flattenHarvestForExport(r: LegacyHarvestListRow) {
  return {
    id: r.id,
    unitId: r.unitId,
    harvest_date: r.harvest_date,
    harvest_type: r.harvest_type,
    status: r.status,
    total_weight: r.total_weight,
    cage_name: r.cages?.name ?? '',
    cage_code: r.cages?.code ?? '',
  };
}

export type FarmExportType = 'cages' | 'daily' | 'biweekly' | 'harvest';

export async function fetchExportDataset(
  exportType: FarmExportType,
  farmId: string,
  dateRange: { startDate: string; endDate: string },
): Promise<unknown[]> {
  switch (exportType) {
    case 'cages':
      return (await fetchLegacyUnitsForFarm(farmId, { limit: 500 })).legacy;
    case 'daily':
      return fetchDailyExportRowsForFarm(
        farmId,
        dateRange.startDate,
        dateRange.endDate,
      );
    case 'biweekly': {
      const bi = await fetchLegacyBiweeklyRowsForFarm(farmId, {
        from: dateRange.startDate,
        to: dateRange.endDate,
        samplesPerUnit: 200,
      });
      return bi.map(flattenBiweeklyForExport);
    }
    case 'harvest': {
      const h = await fetchLegacyHarvestRowsForFarm(farmId, {
        from: dateRange.startDate,
        to: dateRange.endDate,
        limitPerUnit: 200,
      });
      return h.map(flattenHarvestForExport);
    }
    default:
      return [];
  }
}
