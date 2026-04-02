import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { normalizeDailyRecordList } from '@/hooks/units/useDailyRecords';
import type { DailyRecordDto } from '@/api/types/unit-records.types';

export type ReportTypeOption =
  | 'production'
  | 'feed'
  | 'growth'
  | 'mortality'
  | 'financial';

const PAGE = 100;

function normalizePaginated(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === 'object' && 'items' in data) {
    const items = (data as { items?: unknown }).items;
    if (Array.isArray(items)) return items as Record<string, unknown>[];
  }
  return [];
}

async function fetchAllDailyRecords(
  unitId: string,
  from: string,
  to: string,
): Promise<DailyRecordDto[]> {
  const out: DailyRecordDto[] = [];
  for (let page = 1; ; page++) {
    const { data: raw } = await apiClient.get(API.units.dailyRecords(unitId), {
      params: { from, to, limit: PAGE, page },
    });
    const batch = normalizeDailyRecordList(raw);
    out.push(...batch);
    if (batch.length < PAGE) break;
  }
  return out;
}

async function fetchAllWeightSamples(
  unitId: string,
  from: string,
  to: string,
): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = [];
  for (let page = 1; ; page++) {
    const { data: raw } = await apiClient.get(API.units.weightSamples(unitId), {
      params: { from, to, limit: PAGE, page },
    });
    const batch = normalizePaginated(raw);
    out.push(...batch);
    if (batch.length < PAGE) break;
  }
  return out;
}

async function fetchAllHarvests(
  unitId: string,
  from: string,
  to: string,
): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = [];
  for (let page = 1; ; page++) {
    const { data: raw } = await apiClient.get(API.units.harvests(unitId), {
      params: { from, to, limit: PAGE, page },
    });
    const batch = normalizePaginated(raw);
    out.push(...batch);
    if (batch.length < PAGE) break;
  }
  return out;
}

export interface FarmReportResult {
  reportType: ReportTypeOption;
  dateRange: { startDate: string; endDate: string };
  selectedCages: string[];
  generatedAt: string;
  data: {
    totalFeedKg: number;
    totalMortality: number;
    totalFeedCostGhs: number;
    dailyRecordCount: number;
    weightSampleCount: number;
    harvestCount: number;
    totalHarvestWeightKg: number;
    meanFcr: number | null;
    sampleAbwMinG: number | null;
    sampleAbwMaxG: number | null;
    abwRangeG: number | null;
  };
  byUnit: Array<{
    unitId: string;
    unitName: string;
    feedKg: number;
    mortality: number;
    feedCostGhs: number;
    dailyRows: number;
    samples: number;
    harvests: number;
    harvestWeightKg: number;
  }>;
}

export async function buildFarmReport(params: {
  unitIds: string[];
  unitNameById: Record<string, string>;
  dateRange: { startDate: string; endDate: string };
  reportType: ReportTypeOption;
}): Promise<FarmReportResult> {
  const { unitIds, unitNameById, dateRange, reportType } = params;
  const from = dateRange.startDate;
  const to = dateRange.endDate;

  const byUnit: FarmReportResult['byUnit'] = [];
  let totalFeedKg = 0;
  let totalMortality = 0;
  let totalFeedCostGhs = 0;
  let dailyRecordCount = 0;
  let weightSampleCount = 0;
  let harvestCount = 0;
  let totalHarvestWeightKg = 0;
  const fcrValues: number[] = [];
  const sampleAbws: number[] = [];

  for (const unitId of unitIds) {
    const unitName = unitNameById[unitId] ?? unitId;
    const dailies = await fetchAllDailyRecords(unitId, from, to);
    let feedKg = 0;
    let mort = 0;
    let costGhs = 0;
    for (const d of dailies) {
      if (d.feedQuantityKg != null) feedKg += Number(d.feedQuantityKg);
      if (d.mortalityCount != null) mort += Number(d.mortalityCount);
      if (d.feedCostGhs != null) costGhs += Number(d.feedCostGhs);
    }
    const samples = await fetchAllWeightSamples(unitId, from, to);
    for (const s of samples) {
      const abw = s.avgWeightG != null ? Number(s.avgWeightG) : NaN;
      if (Number.isFinite(abw)) sampleAbws.push(abw);
    }
    const harvests = await fetchAllHarvests(unitId, from, to);
    let hWeight = 0;
    for (const h of harvests) {
      if (h.totalWeightKg != null) hWeight += Number(h.totalWeightKg);
      if (h.fcr != null) {
        const f = Number(h.fcr);
        if (Number.isFinite(f)) fcrValues.push(f);
      }
    }

    totalFeedKg += feedKg;
    totalMortality += mort;
    totalFeedCostGhs += costGhs;
    dailyRecordCount += dailies.length;
    weightSampleCount += samples.length;
    harvestCount += harvests.length;
    totalHarvestWeightKg += hWeight;

    byUnit.push({
      unitId,
      unitName,
      feedKg,
      mortality: mort,
      feedCostGhs: costGhs,
      dailyRows: dailies.length,
      samples: samples.length,
      harvests: harvests.length,
      harvestWeightKg: hWeight,
    });
  }

  const sampleAbwMinG =
    sampleAbws.length > 0 ? Math.min(...sampleAbws) : null;
  const sampleAbwMaxG =
    sampleAbws.length > 0 ? Math.max(...sampleAbws) : null;
  const abwRangeG =
    sampleAbwMinG != null && sampleAbwMaxG != null
      ? sampleAbwMaxG - sampleAbwMinG
      : null;
  const meanFcr =
    fcrValues.length > 0
      ? fcrValues.reduce((a, b) => a + b, 0) / fcrValues.length
      : null;

  return {
    reportType,
    dateRange,
    selectedCages: unitIds,
    generatedAt: new Date().toISOString(),
    data: {
      totalFeedKg,
      totalMortality,
      totalFeedCostGhs,
      dailyRecordCount,
      weightSampleCount,
      harvestCount,
      totalHarvestWeightKg,
      meanFcr,
      sampleAbwMinG,
      sampleAbwMaxG,
      abwRangeG,
    },
    byUnit,
  };
}
