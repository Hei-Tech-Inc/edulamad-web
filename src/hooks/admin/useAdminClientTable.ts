import { useMemo } from 'react';
import { sortRows, type SortDir } from '@/lib/admin/sort-rows';

const PER = 25;

export function useAdminClientTable<T>(
  rows: T[],
  opts: {
    search: string;
    searchText: (row: T) => string;
    sortKey?: string;
    sortDir?: SortDir;
    page: number;
    perPage?: number;
  },
) {
  const { search, sortKey, sortDir, page, searchText } = opts;
  const perPage = opts.perPage ?? PER;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => searchText(r).toLowerCase().includes(q));
  }, [rows, search, searchText]);

  const sorted = useMemo(
    () => sortRows(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir],
  );

  const total = sorted.length;

  const pageData = useMemo(() => {
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, page, perPage]);

  return { pageData, total, allRows: sorted, perPage };
}
