'use client';

import { BarChart3, LineChart, PieChart, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminStatItem {
  label: string;
  value: string | number;
}

const ICONS = [BarChart3, LineChart, PieChart, Sparkles] as const;

export function AdminQuickStats({ stats }: { stats: AdminStatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Ico = ICONS[i % ICONS.length];
        return (
          <div
            key={stat.label}
            className={cn(
              'flex flex-col gap-2 rounded-xl border border-white/10',
              'bg-gradient-to-b from-[#15284d] to-[#101f3f] p-4',
              'shadow-sm shadow-slate-900/40 transition-colors hover:border-brand/35',
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/12 text-brand ring-1 ring-brand/15">
              <Ico className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
            </div>
            <p className="font-mono text-2xl font-bold tabular-nums tracking-tight text-brand">
              {typeof stat.value === 'number'
                ? stat.value.toLocaleString()
                : stat.value}
            </p>
            <p className="text-[13px] leading-snug text-slate-200/90">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
