'use client';

import { Lock } from 'lucide-react';
import type { Plan, PlanFeature, BillingPeriod } from '@/lib/pricing';
import { semesterSavingLabel } from '@/lib/pricing';
import { cn } from '@/lib/utils';

type Props = {
  plan: Plan;
  billing: BillingPeriod;
  isCurrent?: boolean;
  isHighlighted?: boolean;
  onSelect?: () => void;
  urgencyLabel?: string | null;
};

function FeatureRow({ feature }: { feature: PlanFeature }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 text-sm',
        !feature.included && 'opacity-60',
      )}
    >
      {feature.included ? (
        <span
          className={cn(
            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-xs',
            feature.highlight
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
          )}
        >
          ✓
        </span>
      ) : (
        <Lock
          className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600"
          aria-hidden
        />
      )}
      <span
        className={cn(
          feature.highlight && feature.included && 'font-medium text-slate-900 dark:text-white',
        )}
        title={feature.tooltip}
      >
        {feature.label}
        {feature.limit ? (
          <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {feature.limit}
          </span>
        ) : null}
      </span>
    </div>
  );
}

export function PlanCard({
  plan,
  billing,
  isCurrent = false,
  isHighlighted = false,
  onSelect,
  urgencyLabel,
}: Props) {
  const price =
    billing === 'semester' ? plan.displaySemester : plan.displayMonthly;
  const period = billing === 'semester' ? '/semester' : '/month';
  const originalPrice =
    billing === 'semester' ? plan.originalSemester : undefined;
  const saving =
    billing === 'semester' ? semesterSavingLabel(plan) : null;

  return (
    <div
      className={cn(
        'relative flex flex-col gap-4 rounded-2xl border p-6 transition-all duration-200',
        isHighlighted
          ? 'scale-[1.02] border-orange-500 bg-white shadow-[0_0_0_2px_rgba(249,115,22,0.25)] dark:bg-slate-900'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
        isCurrent && 'ring-2 ring-emerald-500',
      )}
    >
      {isCurrent ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white">
            Your current plan
          </span>
        </div>
      ) : null}

      {plan.badge && !isCurrent ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold text-white',
              plan.badgeColor ?? 'bg-orange-500',
            )}
          >
            {plan.badge}
          </span>
        </div>
      ) : null}

      {urgencyLabel && plan.id === 'pro' && !isCurrent ? (
        <div className="absolute -right-1 -top-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950 shadow">
          {urgencyLabel}
        </div>
      ) : null}

      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {plan.name}
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">{plan.tagline}</p>
      </div>

      <div>
        <div className="flex items-end gap-1">
          <span
            className={cn(
              'text-4xl font-bold tabular-nums',
              isHighlighted ? 'text-orange-500' : 'text-slate-900 dark:text-white',
            )}
          >
            {price}
          </span>
          {price !== '₵0' ? (
            <span className="mb-1 text-sm text-slate-500">{period}</span>
          ) : null}
        </div>
        {originalPrice && billing === 'semester' ? (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-400 line-through">
              {originalPrice}
            </span>
            {saving ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                {saving}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {plan.studentCount ? (
        <p className="text-xs text-slate-400">{plan.studentCount}</p>
      ) : null}

      <button
        type="button"
        onClick={onSelect}
        disabled={isCurrent}
        className={cn(
          'relative w-full overflow-hidden rounded-xl py-3 text-sm font-semibold transition',
          isCurrent
            ? 'cursor-default bg-slate-100 text-slate-400 dark:bg-slate-800'
            : isHighlighted
              ? 'relative btn-pricing-shimmer bg-orange-500 text-white shadow-lg hover:bg-orange-600'
              : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100',
        )}
      >
        {isCurrent ? 'Current plan' : plan.ctaLabel}
      </button>

      {plan.ctaSubtext && !isCurrent ? (
        <p className="text-center text-xs text-slate-500">{plan.ctaSubtext}</p>
      ) : null}

      <div className="mt-2 flex flex-col gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
        {plan.features.map((f) => (
          <FeatureRow key={f.label} feature={f} />
        ))}
      </div>
    </div>
  );
}
