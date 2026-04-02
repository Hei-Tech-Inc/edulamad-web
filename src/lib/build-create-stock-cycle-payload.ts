export type StockCycleSpecies =
  | 'tilapia_nile'
  | 'tilapia_blue'
  | 'catfish'
  | 'other';

export type CreateStockCycleFormShape = {
  species: StockCycleSpecies;
  stockingDate: string;
  fishCount: string | number;
  initialABW: string | number;
  sourceName: string;
  sourceLocation: string;
  sourceCage: string;
  transferSupervisor: string;
  samplingSupervisor: string;
  batchNumber: string;
};

export function buildNotesFromStockingFormExtras(
  data: Pick<
    CreateStockCycleFormShape,
    | 'batchNumber'
    | 'sourceCage'
    | 'transferSupervisor'
    | 'samplingSupervisor'
  >,
): string | undefined {
  const lines: string[] = [];
  if (data.batchNumber?.trim()) lines.push(`Batch: ${data.batchNumber.trim()}`);
  if (data.sourceCage?.trim())
    lines.push(`Source cage: ${data.sourceCage.trim()}`);
  if (data.transferSupervisor?.trim())
    lines.push(`Transfer supervisor: ${data.transferSupervisor.trim()}`);
  if (data.samplingSupervisor?.trim())
    lines.push(`Sampling supervisor: ${data.samplingSupervisor.trim()}`);
  if (lines.length === 0) return undefined;
  return lines.join('\n');
}

export function buildCreateStockCycleBody(data: CreateStockCycleFormShape) {
  const sourceName = data.sourceName.trim();
  if (!sourceName) {
    throw new Error('Supplier or hatchery name is required');
  }
  const count = Number(data.fishCount);
  const abw = Number(data.initialABW);
  if (!Number.isFinite(count) || count <= 0) {
    throw new Error('Valid fish count is required');
  }
  if (!Number.isFinite(abw) || abw <= 0) {
    throw new Error('Valid initial ABW (g) is required');
  }

  const notes = buildNotesFromStockingFormExtras(data);
  const srcLoc = data.sourceLocation.trim();

  return {
    species: data.species,
    stockingDate: data.stockingDate,
    initialCount: Math.round(count),
    initialAvgWeightG: abw,
    sourceName,
    ...(srcLoc ? { sourceLocation: srcLoc } : {}),
    ...(notes ? { notes } : {}),
  };
}
