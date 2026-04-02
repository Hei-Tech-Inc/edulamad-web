import type { PaginatedResponse } from './common.types';

export type UnitType =
  | 'earthen'
  | 'concrete'
  | 'cage'
  | 'nursery_cage'
  | 'tank'
  | 'raceway'
  | 'other';

export type UnitStatus =
  | 'active'
  | 'fallow'
  | 'harvesting'
  | 'maintenance'
  | 'empty';

export interface Unit {
  id: string;
  farmId?: string;
  name: string;
  unitType: UnitType;
  areaM2?: number | null;
  depthM?: number | null;
  constructionYear?: number | null;
  constructionCostGhs?: number | null;
  linerType?: string | null;
  inletType?: string | null;
  outletType?: string | null;
  aerationType?: string | null;
  shadingPercent?: number | null;
  drainageType?: string | null;
  gpsLatitude?: number | null;
  gpsLongitude?: number | null;
  status?: UnitStatus | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface UnitFilters {
  page?: number;
  limit?: number;
  status?: UnitStatus;
}

export type UnitListResponse = PaginatedResponse<Unit>;
