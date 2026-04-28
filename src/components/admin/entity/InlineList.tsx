'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function InlineList<T>({
  title,
  items,
  isLoading,
  onAdd,
  addLabel,
  emptyMessage,
  renderItem,
  search,
}: {
  title: string;
  items: T[];
  isLoading: boolean;
  onAdd: () => void;
  addLabel?: string;
  emptyMessage?: string;
  renderItem: (item: T) => ReactNode;
  search?: boolean;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-3">
          {search && items.length > 5 ? (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="h-8 flex-1 rounded-lg border border-white/[0.08] bg-bg-raised px-3 text-xs text-text-primary placeholder:text-text-muted focus:border-brand/50 focus:outline-none"
            />
          ) : null}
          <p className="text-xs text-text-muted">
            {items.length} {title.toLowerCase()}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onAdd}>
          + {addLabel ?? `Add ${title.slice(0, -1)}`}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-white/10" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed py-10 text-center">
          <p className="text-sm text-text-muted">
            {query
              ? `No results for "${query}"`
              : emptyMessage ?? `No ${title.toLowerCase()} yet`}
          </p>
          {!query ? (
            <button
              onClick={onAdd}
              className="mt-2 text-xs text-brand transition-colors hover:underline"
            >
              {addLabel ?? `+ Add first ${title.slice(0, -1).toLowerCase()}`}
            </button>
          ) : null}
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((item, i) => (
            <div key={i}>{renderItem(item)}</div>
          ))}
        </div>
      )}
    </div>
  );
}
