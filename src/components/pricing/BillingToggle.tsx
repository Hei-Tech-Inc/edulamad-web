'use client';

import type { BillingPeriod } from '@/lib/pricing';

type Props = {
  value: BillingPeriod;
  onChange: (v: BillingPeriod) => void;
  savePercentMax?: number;
};

export function BillingToggle({
  value,
  onChange,
  savePercentMax = 36,
}: Props) {
  return (
    <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
      <button
        type="button"
        onClick={() => onChange('monthly')}
        className={`text-sm font-medium transition-colors ${
          value === 'monthly'
            ? 'text-slate-900 dark:text-white'
            : 'text-slate-400'
        }`}
      >
        Monthly
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={value === 'semester'}
        onClick={() =>
          onChange(value === 'monthly' ? 'semester' : 'monthly')
        }
        className="relative h-7 w-12 shrink-0 rounded-full bg-orange-500 transition-colors"
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            value === 'semester' ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>

      <button
        type="button"
        onClick={() => onChange('semester')}
        className={`flex flex-wrap items-center justify-center gap-2 text-sm font-medium transition-colors ${
          value === 'semester'
            ? 'text-slate-900 dark:text-white'
            : 'text-slate-400'
        }`}
      >
        <span>Semester</span>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
          Save up to {savePercentMax}%
        </span>
      </button>
    </div>
  );
}
