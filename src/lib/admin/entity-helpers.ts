export type AnyRow = Record<string, unknown>;

export function toRow(v: unknown): AnyRow {
  return v && typeof v === 'object' ? (v as AnyRow) : {};
}

export function valueId(v: unknown): string {
  const r = toRow(v);
  const id = r.id ?? r._id ?? r.uuid;
  return typeof id === 'string' ? id : typeof id === 'number' ? String(id) : '';
}

export function valueName(v: unknown): string {
  const r = toRow(v);
  const n = r.name ?? r.title ?? r.label;
  return typeof n === 'string' ? n : '';
}

export function valueCode(v: unknown): string {
  const r = toRow(v);
  return typeof r.code === 'string'
    ? r.code
    : typeof r.acronym === 'string'
      ? r.acronym
      : '';
}

export function valueBool(v: unknown, key: string, fallback: boolean): boolean {
  const r = toRow(v);
  const x = r[key];
  return typeof x === 'boolean' ? x : fallback;
}

export function valueString(v: unknown, key: string): string {
  const r = toRow(v);
  const x = r[key];
  return typeof x === 'string' ? x : '';
}
