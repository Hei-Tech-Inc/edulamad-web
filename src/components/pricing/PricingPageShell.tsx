'use client';

import { CheckCircle2 } from 'lucide-react';
import { getPlan, type BillingPeriod } from '@/lib/pricing';
import { PricingCards } from '@/components/pricing/PricingCards';
import { getMarketingBrandName } from '@/lib/landing-brand';
import { cn } from '@/lib/utils';

const BRAND = getMarketingBrandName();

const TRUST_PILLS = [
  'Semester savings vs 4× monthly',
  'MTN, Vodafone & cards',
  'Cancel any time',
];

type Props = {
  currentPlanId?: string;
  onSelectPlan?: (planId: string, billing: BillingPeriod) => void;
  /** Marketing vs in-app copy tweaks */
  variant?: 'marketing' | 'app';
};

export function PricingPageShell({
  currentPlanId = 'free',
  onSelectPlan,
  variant = 'marketing',
}: Props) {
  const pro = getPlan('pro');
  const basic = getPlan('basic');
  const isApp = variant === 'app';

  return (
    <div
      className={cn(
        'relative mx-auto max-w-6xl px-4 text-text-primary sm:px-6 lg:px-8',
        isApp ? 'py-8 sm:py-10' : 'py-12 sm:py-16 lg:py-20',
      )}
    >
      {!isApp ? (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[28rem] overflow-hidden rounded-[2rem] bg-gradient-to-b from-teal-500/[0.07] via-orange-500/[0.05] to-transparent dark:from-teal-500/10 dark:via-bg-base/40 dark:to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-24 top-32 -z-10 h-72 w-72 rounded-full bg-orange-400/12 blur-3xl dark:bg-orange-500/10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-20 top-48 -z-10 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-600/12"
            aria-hidden
          />
        </>
      ) : null}

      <header className="relative text-center">
        {!isApp ? (
          <div className="mx-auto inline-flex flex-wrap items-center justify-center gap-2">
            {TRUST_PILLS.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/[0.06] px-3 py-1 text-xs font-semibold text-teal-900 shadow-sm backdrop-blur-sm dark:border-teal-500/25 dark:bg-teal-500/10 dark:text-teal-200"
              >
                <CheckCircle2
                  className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden
                />
                {label}
              </span>
            ))}
          </div>
        ) : null}

        <p
          className={cn(
            'text-sm font-bold uppercase tracking-[0.14em] text-orange-700 dark:text-orange-300',
            isApp ? 'mt-0' : 'mt-8',
          )}
        >
          Pro from {pro.displayMonthly}/mo · semester {pro.displaySemester}{' '}
          <span className="text-text-muted line-through">
            {pro.originalSemester}
          </span>{' '}
          <span className="text-emerald-700 dark:text-emerald-300">
            (save vs list)
          </span>
        </p>

        <h1
          className={cn(
            'mt-4 font-[Outfit,system-ui,sans-serif] font-bold tracking-tight text-text-primary',
            isApp
              ? 'text-2xl sm:text-3xl'
              : 'text-4xl leading-[1.08] sm:text-5xl',
          )}
        >
          {variant === 'marketing'
            ? 'Exam prep that pays for itself.'
            : 'Choose how much exam prep you keep'}
        </h1>

        <p
          className={cn(
            'mx-auto max-w-2xl leading-relaxed text-text-secondary',
            isApp ? 'mt-3 text-base' : 'mt-5 max-w-2xl text-lg',
          )}
        >
          {variant === 'marketing'
            ? 'Past papers, solutions, and AI explanations in one place — priced for students. Pick monthly or save with a semester bundle.'
            : 'See what you are missing on Free, and what Basic adds before Pro.'}
        </p>

        {!isApp ? (
          <>
            <p className="mt-6 text-sm font-semibold text-text-secondary">
              Join 13,000+ students at 15+ Ghanaian universities
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-text-muted">
              Basic from {basic.displayMonthly}/mo ·{' '}
              <span className="font-semibold text-text-secondary">
                {basic.displaySemester}/sem
              </span>{' '}
              vs{' '}
              <span className="font-semibold text-text-secondary">
                {pro.displaySemester}/sem for Pro
              </span>{' '}
              with full AI + tutor.
            </p>
          </>
        ) : null}
      </header>

      <div className={cn('relative', isApp ? 'mt-8' : 'mt-14')}>
        {!isApp ? (
          <div className="absolute -inset-x-4 -inset-y-6 -z-10 rounded-3xl bg-gradient-to-br from-bg-surface/85 via-bg-base/40 to-transparent ring-1 ring-[var(--border-default)] dark:from-bg-surface/50 dark:via-bg-base/30 dark:to-transparent" />
        ) : null}
        <PricingCards
          currentPlanId={currentPlanId}
          highlightPlanId="pro"
          onSelectPlan={onSelectPlan}
          context="page"
          showComparisonAndFaq
        />
      </div>

      {!isApp ? (
        <div className="relative mt-16 overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/[0.08] via-bg-surface/90 to-orange-500/[0.07] p-8 text-center shadow-[0_20px_60px_-35px_rgba(15,118,110,0.18)] dark:from-teal-500/10 dark:via-bg-surface/60 dark:to-orange-500/10 sm:rounded-3xl">
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-orange-400/10 blur-2xl dark:bg-orange-400/15"
            aria-hidden
          />
          <p className="relative font-[Outfit,system-ui,sans-serif] text-lg font-semibold text-text-primary sm:text-xl">
            “I passed all 5 courses this semester using {BRAND}.”
          </p>
          <p className="relative mt-2 text-sm font-medium text-text-secondary">
            — Kwame A., Level 300, KNUST Computer Science
          </p>
        </div>
      ) : null}
    </div>
  );
}
