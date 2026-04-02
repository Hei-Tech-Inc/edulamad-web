import type { PaginatedResponse } from './common.types';

export type FarmRegion =
  | 'greater_accra'
  | 'volta'
  | 'ashanti'
  | 'central'
  | 'northern'
  | 'upper_east'
  | 'upper_west'
  | 'western'
  | 'eastern'
  | 'bono'
  | 'other';

export type FarmSoilType = 'clay' | 'loam' | 'sandy' | 'laterite' | 'other';

export type FarmRoadAccessType = 'tarred' | 'gravel' | 'dirt' | 'footpath';

export type FarmWaterSource =
  | 'river'
  | 'borehole'
  | 'rain'
  | 'municipal'
  | 'pond'
  | 'mixed';

export type FarmStatus = 'active' | 'inactive';

/** POST /farms — CreateFarmDto */
export interface CreateFarmDto {
  name: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  region?: FarmRegion;
  district?: string;
  community?: string;
  totalLandAreaHa?: number;
  waterAreaHa?: number;
  soilType?: FarmSoilType;
  altitudeM?: number;
  roadAccessType?: FarmRoadAccessType;
  electricityAccess?: boolean;
  waterSource?: FarmWaterSource;
  status?: FarmStatus;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export type UpdateFarmDto = Partial<CreateFarmDto>;

export interface FarmFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: FarmStatus;
  region?: FarmRegion;
}

/** Entity returned for farms — extends create DTO with server fields (exact shape when backend documents it). */
export interface Farm extends CreateFarmDto {
  id: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type FarmListResponse = PaginatedResponse<Farm>;
