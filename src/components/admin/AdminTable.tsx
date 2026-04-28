'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { rowId } from '@/lib/admin/pick-array';
import type { SortDir } from '@/lib/admin/sort-rows';
import { cn } from '@/lib/utils';

export type { SortDir } from '@/lib/admin/sort-rows';

export interface AdminColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

export function AdminTable<T>({
  columns,
  data,
  isLoading,
  total,
  page,
  perPage,
  onPageChange,
  onSort,
  sortKey,
  sortDir,
  onEdit,
  onDelete,
  onView,
  selectable,
  onBulkDelete,
  onExport,
  exportLabel,
  emptyIcon = '📭',
  emptyTitle = 'No items found',
  emptyAction,
  getRowId = (row) => rowId(row as unknown),
}: {
  columns: AdminColumn<T>[];
  data: T[];
  isLoading: boolean;
  total: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onSort?: (key: string, dir: SortDir) => void;
  sortKey?: string;
  sortDir?: SortDir;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  selectable?: boolean;
  onBulkDelete?: (rows: T[]) => void;
  onExport?: () => void;
  exportLabel?: string;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyAction?: { label: string; onClick: () => void };
  getRowId?: (row: T) => string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const idList = useMemo(
    () => data.map((r) => getRowId(r)).filter(Boolean),
    [data, getRowId],
  );

  const totalPages = Math.max(1, Math.ceil(total / perPage) || 1);

  const toggleRow = useCallback(
    (id: string) => {
      setSelected((s) => {
        const n = new Set(s);
        if (n.has(id)) n.delete(id);
        else n.add(id);
        return n;
      });
    },
    [],
  );

  const toggleAll = useCallback(() => {
    setSelected((s) => {
      if (s.size === idList.length && idList.length > 0) return new Set();
      return new Set(idList);
    });
  }, [idList]);

  const hasRowActions = Boolean(onEdit || onDelete || onView);
  const colCount =
    columns.length + (selectable ? 1 : 0) + (hasRowActions ? 1 : 0);

  return (
    <div className="flex flex-col gap-3">
      {selectable && selected.size > 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-brand/20 bg-brand/10 px-4 py-2.5">
          <p className="text-sm font-medium text-brand">{selected.size} selected</p>
          <div className="flex-1" />
          {onBulkDelete ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                const rows = data.filter((r) => selected.has(getRowId(r)));
                onBulkDelete(rows);
                setSelected(new Set());
              }}
            >
              Delete selected
            </Button>
          ) : null}
          <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {selectable ? (
                  <th className="w-10 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={idList.length > 0 && selected.size === idList.length}
                      onChange={toggleAll}
                      className="h-4 w-4 accent-brand"
                    />
                  </th>
                ) : null}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold tracking-wider text-text-secondary uppercase',
                      col.sortable && onSort
                        ? 'cursor-pointer select-none hover:text-text-primary'
                        : '',
                    )}
                    onClick={() => {
                      if (!col.sortable || !onSort) return;
                      onSort(
                        col.key,
                        sortKey === col.key && sortDir === 'asc' ? 'desc' : 'asc',
                      );
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortKey === col.key ? (
                        <span className="text-brand">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      ) : null}
                    </span>
                  </th>
                ))}
                {hasRowActions ? <th className="w-28 px-4 py-3" /> : null}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="border-b border-white/[0.04]">
                      {selectable ? (
                        <td className="px-4 py-3">
                          <div className="h-4 w-4 animate-pulse rounded bg-white/10" />
                        </td>
                      ) : null}
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3">
                          <div
                            className="h-4 animate-pulse rounded bg-white/10"
                            style={{ width: col.width ?? '80%' }}
                          />
                        </td>
                      ))}
                      {hasRowActions ? (
                        <td className="px-4 py-3">
                          <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
                        </td>
                      ) : null}
                    </tr>
                  ))
                : data.length === 0
                  ? (
                      <tr>
                        <td colSpan={colCount} className="px-4 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <span className="text-4xl">{emptyIcon}</span>
                            <p className="text-sm font-medium text-text-primary">{emptyTitle}</p>
                            {emptyAction ? (
                              <Button type="button" variant="secondary" size="sm" onClick={emptyAction.onClick}>
                                {emptyAction.label}
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  : data.map((row) => {
                      const rid = getRowId(row);
                      return (
                        <tr
                          key={rid || JSON.stringify(row)}
                          className="group border-b border-white/[0.04] transition-colors hover:bg-bg-raised"
                        >
                          {selectable ? (
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={rid ? selected.has(rid) : false}
                                onChange={() => rid && toggleRow(rid)}
                                className="h-4 w-4 accent-brand"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                          ) : null}
                          {columns.map((col) => (
                            <td
                              key={col.key}
                              className="max-w-[min(28rem,40vw)] truncate whitespace-nowrap px-4 py-3 text-text-primary"
                              title={undefined}
                            >
                              {col.render(row)}
                            </td>
                          ))}
                          {hasRowActions ? (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                {onView ? (
                                  <button
                                    type="button"
                                    onClick={() => onView(row)}
                                    className="rounded px-2 py-1 text-xs text-text-muted hover:text-brand"
                                  >
                                    View
                                  </button>
                                ) : null}
                                {onEdit ? (
                                  <button
                                    type="button"
                                    onClick={() => onEdit(row)}
                                    className="rounded px-2 py-1 text-xs text-text-muted hover:text-brand"
                                  >
                                    Edit
                                  </button>
                                ) : null}
                                {onDelete ? (
                                  <button
                                    type="button"
                                    onClick={() => onDelete(row)}
                                    className="rounded px-2 py-1 text-xs text-text-muted hover:text-danger"
                                  >
                                    Delete
                                  </button>
                                ) : null}
                              </div>
                            </td>
                          ) : null}
                        </tr>
                      );
                    })}
            </tbody>
          </table>
        </div>

        {!isLoading && totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
            <p className="text-xs text-text-muted">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of{' '}
              {total.toLocaleString()}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-text-muted transition-colors hover:bg-bg-raised disabled:opacity-30"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 text-xs text-text-primary">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-text-muted transition-colors hover:bg-bg-raised disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {onExport ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-text-primary"
          >
            ↓ {exportLabel ?? 'Export CSV'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export { sortRows } from '@/lib/admin/sort-rows';
