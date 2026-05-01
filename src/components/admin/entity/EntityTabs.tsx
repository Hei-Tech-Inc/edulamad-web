'use client';

export interface EntityTab {
  id: string;
  label: string;
  count?: number;
  icon?: string;
}

export function EntityTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: EntityTab[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="scrollbar-none -mx-4 flex items-center gap-1 overflow-x-auto border-b border-slate-200 px-4 sm:mx-0 sm:px-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
            active === tab.id
              ? 'border-brand text-brand'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          {tab.icon ? <span className="text-base">{tab.icon}</span> : null}
          {tab.label}
          {tab.count !== undefined ? (
            <span
              className={`rounded-full px-1.5 py-0.5 font-mono text-xs ${
                active === tab.id
                  ? 'bg-brand/15 text-brand'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
