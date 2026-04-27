'use client';

import type { Plan, BillingPeriod } from '@/lib/pricing';
import { semesterSavingLabel } from '@/lib/pricing';
import { cn } from '@/lib/utils';

type Props = {
  plan: Plan;
  billing: BillingPeriod;
  highlighted?: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

export function CompactPlanCard({
  plan,
  billing,
  highlighted = false,
  disabled = false,
  onSelect,
}: Props) {
  const price =
    billing === 'semester' ? plan.displaySemester : plan.displayMonthly;
  const period = billing === 'semester' ? '/semester' : '/month';
  const original =
    billing === 'semester' ? plan.originalSemester : undefined;
  const saving =
    billing === 'semester' ? semesterSavingLabel(plan) : null;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border p-4',
        highlighted
          ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
      )}
    >
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {plan.name}
        </p>
        <p className="text-xs text-slate-500">{plan.tagline}</p>
      </div>
      <div className="flex flex-wrap items-end gap-1">
        <span
          className={cn(
            'text-2xl font-bold tabular-nums',
            highlighted ? 'text-orange-600' : 'text-slate-900 dark:text-white',
          )}
        >
          {price}
        </span>
        {price !== '₵0' ? (
          <span className="text-xs text-slate-500">{period}</span>
        ) : null}
      </div>
      {original ? (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 line-through">{original}</span>
          {saving ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
              {saving}
            </span>
          ) : null}
        </div>
      ) : null}
      <p className="text-[11px] text-slate-500">{plan.studentCount}</p>
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className={cn(
          'w-full rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:opacity-60',
          highlighted
            ? 'bg-orange-500 hover:bg-orange-600'
            : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100',
        )}
      >
        {plan.ctaLabel}
      </button>
      {plan.ctaSubtext ? (
        <p className="text-center text-[11px] text-slate-500">
          {plan.ctaSubtext}
        </p>
      ) : null}
    </div>
  );
}
