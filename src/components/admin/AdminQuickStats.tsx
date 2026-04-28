'use client';

import { cn } from '@/lib/utils';

export interface AdminStatItem {
  label: string;
  value: string | number;
  icon?: string;
  color?: 'orange' | 'green' | 'blue' | 'amber' | 'red';
}

const colors: Record<NonNullable<AdminStatItem['color']>, string> = {
  orange: 'text-brand',
  green: 'text-success',
  blue: 'text-info',
  amber: 'text-warning',
  red: 'text-danger',
};

export function AdminQuickStats({ stats }: { stats: AdminStatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-1 rounded-lg border border-white/[0.08] bg-bg-surface p-4"
        >
          {stat.icon ? <span className="text-lg">{stat.icon}</span> : null}
          <p
            className={cn(
              'font-mono text-2xl font-bold tabular-nums',
              stat.color ? colors[stat.color] : 'text-text-primary',
            )}
          >
            {typeof stat.value === 'number'
              ? stat.value.toLocaleString()
              : stat.value}
          </p>
          <p className="text-xs text-text-muted">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
