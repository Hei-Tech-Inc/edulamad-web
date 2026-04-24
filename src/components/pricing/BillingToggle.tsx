'use client';

import type { BillingPeriod } from '@/lib/pricing';
import { cn } from '@/lib/utils';

type Props = {
  value: BillingPeriod;
  onChange: (v: BillingPeriod) => void;
  savePercentMax?: number;
  /** Tighter spacing when embedded (e.g. homepage). */
  compact?: boolean;
  className?: string;
};

export function BillingToggle({
  value,
  onChange,
  savePercentMax = 36,
  compact = false,
  className,
}: Props) {
  const isSemester = value === 'semester';

  return (
    <div className={cn(compact ? 'mb-6' : 'mb-10', className)}>
      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
        Billing cycle
      </p>
      <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center sm:gap-5">
        <button
          type="button"
          onClick={() => onChange('monthly')}
          className={cn(
            'order-1 min-h-[2.75rem] flex-1 rounded-xl px-3 py-2 text-center text-sm font-semibold transition-colors sm:order-none sm:min-h-0 sm:flex-none sm:text-right',
            value === 'monthly'
              ? 'bg-orange-50 text-slate-950 ring-1 ring-orange-200 dark:bg-orange-950/45 dark:text-white dark:ring-orange-700/70'
              : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white',
          )}
        >
          Monthly
        </button>

        <div className="order-2 flex justify-center sm:order-none">
          <button
            type="button"
            role="switch"
            aria-checked={isSemester}
            aria-label={
              isSemester
                ? 'Semester billing (selected). Click for monthly.'
                : 'Monthly billing (selected). Click for semester.'
            }
            onClick={() => onChange(isSemester ? 'monthly' : 'semester')}
            className={cn(
              'relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center justify-start rounded-full p-1',
              'bg-gradient-to-b from-orange-400 to-orange-600 shadow-inner',
              'ring-1 ring-inset ring-white/20',
              'transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950',
            )}
          >
            {/*
              Track: w-14 (56px) − p-1×2 (8px) = 48px inner; thumb w-6 (24px) → travel 24px = translate-x-6.
              Previous w-12 + translate-x-6 overflowed and looked “off”.
            */}
            <span
              className={cn(
                'pointer-events-none block h-6 w-6 rounded-full bg-white shadow-md ring-1 ring-slate-900/10 transition-transform duration-200 ease-out',
                isSemester ? 'translate-x-6' : 'translate-x-0',
              )}
            />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onChange('semester')}
          className={cn(
            'order-3 flex min-h-[2.75rem] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-center transition-colors sm:order-none sm:min-h-0 sm:flex-none sm:flex-row sm:items-center sm:gap-2 sm:text-left',
            value === 'semester'
              ? 'bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:ring-emerald-700/60'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800/60',
          )}
        >
          <span
            className={cn(
              'text-sm font-semibold',
              value === 'semester'
                ? 'text-slate-950 dark:text-white'
                : 'text-slate-700 dark:text-slate-300',
            )}
          >
            Semester
          </span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              value === 'semester'
                ? 'bg-emerald-200 text-emerald-950 dark:bg-emerald-800/90 dark:text-emerald-50'
                : 'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
            )}
          >
            Save up to {savePercentMax}%
          </span>
        </button>
      </div>
    </div>
  );
}
