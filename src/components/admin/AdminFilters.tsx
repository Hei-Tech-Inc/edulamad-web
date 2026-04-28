'use client';

export function AdminSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative min-w-[200px] flex-1">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
        🔍
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Search…'}
        className="h-9 w-full rounded-lg border border-white/[0.08] bg-bg-surface py-1 pr-8 pl-9 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand/50 focus:outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          aria-label="Clear search"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}

export function AdminSelectFilter({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 min-w-[130px] appearance-none rounded-lg border border-white/[0.08] bg-bg-surface px-3 pr-8 text-sm text-text-primary focus:border-brand/50 focus:outline-none"
    >
      <option value="">{placeholder ?? 'All'}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function AdminDateFilter({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className="h-9 rounded-lg border border-white/[0.08] bg-bg-surface px-3 text-sm text-text-primary focus:border-brand/50 focus:outline-none"
      />
      <span className="text-xs text-text-muted">to</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className="h-9 rounded-lg border border-white/[0.08] bg-bg-surface px-3 text-sm text-text-primary focus:border-brand/50 focus:outline-none"
      />
    </div>
  );
}
