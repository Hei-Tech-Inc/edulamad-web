import type { Unit } from '@/api/types/unit.types';

/**
 * Rows expected by legacy cage UI (DataTable, analytics). Fields absent on API are nulled.
 */
export interface LegacyCageRow {
  id: string;
  name: string;
  status: string;
  location: string | null;
  size: number | null;
  /** 'm2' for API units (was m³ in old cage table) */
  sizeUnit: 'm2' | 'm3';
  stocking_date: string | null;
  farmId: string;
  unitType?: string;
  installation_date: string | null;
  initial_weight: number | null;
  current_weight: number | null;
  growth_rate: number | null;
  initial_count: number | null;
  current_count: number | null;
  mortality_rate: number | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
}

function mapApiUnitStatusToLegacy(status?: string | null): string {
  if (status === 'harvesting') return 'ready_to_harvest';
  if (!status) return 'active';
  return status;
}

export function mapUnitToLegacyCage(unit: Unit, farmId: string): LegacyCageRow {
  const loc =
    unit.gpsLatitude != null && unit.gpsLongitude != null
      ? `${Number(unit.gpsLatitude).toFixed(4)}, ${Number(unit.gpsLongitude).toFixed(4)}`
      : null;

  return {
    id: unit.id,
    name: unit.name,
    status: mapApiUnitStatusToLegacy(unit.status),
    location: loc,
    size: unit.areaM2 ?? null,
    sizeUnit: 'm2',
    stocking_date: null,
    farmId,
    unitType: unit.unitType,
    installation_date: unit.constructionYear
      ? `${unit.constructionYear}-01-01`
      : null,
    initial_weight: null,
    current_weight: null,
    growth_rate: null,
    initial_count: null,
    current_count: null,
    mortality_rate: null,
    last_maintenance_date: null,
    next_maintenance_date: null,
  };
}

export function mapUnitsToLegacyCages(
  units: Unit[],
  farmId: string,
): LegacyCageRow[] {
  return units.map((u) => mapUnitToLegacyCage(u, farmId));
}
