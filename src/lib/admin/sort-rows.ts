export type SortDir = 'asc' | 'desc';

function defaultSortValue(row: unknown, key: string): string | number {
  if (!row || typeof row !== 'object') return '';
  const v = (row as Record<string, unknown>)[key];
  if (typeof v === 'string' || typeof v === 'number') return v;
  if (v == null) return '';
  return String(v);
}

/** Client-side sort when the API does not sort. */
export function sortRows<T>(
  rows: T[],
  sortKey: string | undefined,
  sortDir: SortDir | undefined,
): T[] {
  if (!sortKey || !sortDir) return rows;
  const mult = sortDir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = defaultSortValue(a, sortKey);
    const bv = defaultSortValue(b, sortKey);
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mult;
    return String(av).localeCompare(String(bv)) * mult;
  });
}
