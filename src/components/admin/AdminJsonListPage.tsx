'use client';

import { useMemo, useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { AdminSearch } from '@/components/admin/AdminFilters';
import { AdminTable, type AdminColumn } from '@/components/admin/AdminTable';
import { useAdminClientTable } from '@/hooks/admin/useAdminClientTable';
import { rowSearchText } from '@/lib/admin/row-search';
import type { SortDir } from '@/lib/admin/sort-rows';
import { exportToCSV } from '@/lib/utils/export-csv';

function inferColumns(
  rows: Record<string, unknown>[],
  max = 10,
): AdminColumn<Record<string, unknown>>[] {
  const first = rows[0];
  if (!first) {
    return [
      {
        key: '_',
        label: 'Result',
        sortable: false,
        render: () => '—',
      },
    ];
  }
  return Object.keys(first)
    .slice(0, max)
    .map((key) => ({
      key,
      label: key,
      sortable: true,
      render: (row: Record<string, unknown>) => {
        const v = row[key];
        if (v == null) return '—';
        if (typeof v === 'object') return JSON.stringify(v);
        return String(v);
      },
    }));
}

function queryErrorHint(error: unknown): string {
  if (isAxiosError(error)) {
    const s = error.response?.status;
    if (s === 403)
      return 'Forbidden — your account may not have API access to this list.';
    if (s === 404)
      return 'Not found — this route may be missing on the deployed API.';
    const body = error.response?.data;
    if (body && typeof body === 'object' && 'message' in body) {
      const m = (body as { message?: unknown }).message;
      if (typeof m === 'string') return m;
    }
    return error.message;
  }
  return 'Could not load data.';
}

export function AdminJsonListPage({
  title,
  subtitle,
  query,
  exportBaseName,
  columns: columnsProp,
}: {
  title: string;
  subtitle?: string;
  query: Pick<
    UseQueryResult<Record<string, unknown>[]>,
    'data' | 'isLoading' | 'isError' | 'error'
  >;
  exportBaseName: string;
  columns?: AdminColumn<Record<string, unknown>>[];
}) {
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const columns = useMemo(() => {
    if (columnsProp?.length) return columnsProp;
    return inferColumns(rows);
  }, [columnsProp, rows]);

  const searchText = useMemo(
    () => (row: Record<string, unknown>) => rowSearchText(row),
    [],
  );

  const { pageData, total, allRows, perPage } = useAdminClientTable(rows, {
    search,
    searchText,
    sortKey,
    sortDir,
    page,
  });

  const handleSort = (key: string, dir: SortDir) => {
    setSortKey(key);
    setSortDir(dir);
    setPage(1);
  };

  const exportCols = columns.map((c) => ({ key: c.key, label: c.label }));

  return (
    <AdminPageLayout title={title} subtitle={subtitle}>
      {query.isError ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {queryErrorHint(query.error)}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <AdminSearch
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Filter rows…"
        />
      </div>

      <AdminTable<Record<string, unknown>>
        columns={columns}
        data={pageData}
        isLoading={query.isLoading}
        total={query.isError ? 0 : total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onSort={handleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        onExport={
          query.isError || query.isLoading
            ? undefined
            : () => exportToCSV(allRows, exportBaseName, exportCols)
        }
      />
    </AdminPageLayout>
  );
}
