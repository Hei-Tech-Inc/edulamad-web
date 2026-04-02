import type { PaginatedResponse } from './common.types';

/** Fields aligned with Nsuo API; extras allowed for forward compatibility. */
export interface DailyRecordDto {
  id: string;
  date?: string;
  feedType?: string | null;
  feedQuantityKg?: number | null;
  feedCostGhs?: number | null;
  mortalityCount?: number | null;
  notes?: string | null;
  cycleId?: string | null;
  [key: string]: unknown;
}

export interface WeightSampleDto {
  id: string;
  sampledAt?: string;
  avgWeightG?: number | null;
  sampleSize?: number | null;
  notes?: string | null;
  cycleId?: string | null;
  [key: string]: unknown;
}

export interface HarvestRecordDto {
  id: string;
  harvestDate?: string;
  totalWeightKg?: number | null;
  avgWeightG?: number | null;
  estimatedCount?: number | null;
  fcr?: number | null;
  notes?: string | null;
  sizeBreakdownSmallKg?: number | null;
  sizeBreakdownMediumKg?: number | null;
  sizeBreakdownLargeKg?: number | null;
  sizeBreakdownXlKg?: number | null;
  [key: string]: unknown;
}

export type DailyRecordListResponse = PaginatedResponse<DailyRecordDto>;
export type WeightSampleListResponse = PaginatedResponse<WeightSampleDto>;
export type HarvestListResponse = PaginatedResponse<HarvestRecordDto>;
