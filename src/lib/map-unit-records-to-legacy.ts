import type {
  DailyRecordDto,
  HarvestRecordDto,
  WeightSampleDto,
} from '@/api/types/unit-records.types';

/** Shapes expected by `pages/cages/[id].js` tables and charts. */
export interface LegacyDailyRecordRow {
  id: string;
  date: string;
  feed_amount: number;
  feed_type: string;
  feed_cost: number;
  mortality: number;
  notes: string | null;
}

export interface LegacyGrowthRecordRow {
  id: string;
  date: string;
  average_body_weight: number;
  sample_size: number;
  notes: string | null;
}

export interface LegacyHarvestRecordRow {
  harvest_date: string;
  total_weight: number;
  average_body_weight: number;
  estimated_count: number;
  fcr: number | string;
  notes: string | null;
  size_breakdown: { range: string; percentage: number }[];
}

export function mapDailyRecordToLegacy(r: DailyRecordDto): LegacyDailyRecordRow {
  return {
    id: r.id,
    date: r.date ?? '',
    feed_amount: Number(r.feedQuantityKg ?? 0),
    feed_type: String(r.feedType ?? ''),
    feed_cost: Number(r.feedCostGhs ?? 0),
    mortality: Number(r.mortalityCount ?? 0),
    notes: r.notes ?? null,
  };
}

export function mapWeightSampleToGrowthRow(
  w: WeightSampleDto,
): LegacyGrowthRecordRow {
  const rawDate = w.sampledAt ?? '';
  const date =
    rawDate.length >= 10 ? rawDate.slice(0, 10) : rawDate.split('T')[0] ?? '';
  return {
    id: w.id,
    date,
    average_body_weight: Number(w.avgWeightG ?? 0),
    sample_size: Number(w.sampleSize ?? 0),
    notes: w.notes ?? null,
  };
}

function harvestSizeBreakdown(h: HarvestRecordDto): LegacyHarvestRecordRow['size_breakdown'] {
  const s = Number(h.sizeBreakdownSmallKg ?? 0);
  const m = Number(h.sizeBreakdownMediumKg ?? 0);
  const l = Number(h.sizeBreakdownLargeKg ?? 0);
  const xl = Number(h.sizeBreakdownXlKg ?? 0);
  const total = s + m + l + xl;
  if (total <= 0) return [];
  const pct = (kg: number) => Math.round((kg / total) * 1000) / 10;
  return [
    { range: 'Small', percentage: pct(s) },
    { range: 'Medium', percentage: pct(m) },
    { range: 'Large', percentage: pct(l) },
    { range: 'XL', percentage: pct(xl) },
  ].filter((x) => x.percentage > 0);
}

export function mapHarvestToLegacy(h: HarvestRecordDto): LegacyHarvestRecordRow {
  const fcr = h.fcr;
  return {
    harvest_date: h.harvestDate ?? '',
    total_weight: Number(h.totalWeightKg ?? 0),
    average_body_weight: Number(h.avgWeightG ?? 0),
    estimated_count: Number(h.estimatedCount ?? 0),
    fcr:
      fcr == null || Number.isNaN(Number(fcr))
        ? 'N/A'
        : typeof fcr === 'number'
          ? fcr
          : Number(fcr),
    notes: h.notes ?? null,
    size_breakdown: harvestSizeBreakdown(h),
  };
}
