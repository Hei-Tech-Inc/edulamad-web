'use client';

import { getPlan, type BillingPeriod } from '@/lib/pricing';
import { PricingCards } from '@/components/pricing/PricingCards';
import { getMarketingBrandName } from '@/lib/landing-brand';

const BRAND = getMarketingBrandName();

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
          {/* Anchoring: lead with highest list price (4× monthly) then Pro semester */}
          Pro from {pro.displayMonthly}/mo · semester {pro.displaySemester}{' '}
          <span className="text-slate-400 line-through">{pro.originalSemester}</span>{' '}
          <span className="text-emerald-700 dark:text-emerald-400">
            (save vs {pro.originalSemester} list)
          </span>
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {variant === 'marketing'
            ? 'Stop losing marks to photocopied papers with no answers.'
            : 'Choose how much exam prep you keep'}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-400">
          {variant === 'marketing'
            ? 'Every past paper. Solutions where we have them. AI when you do not. Basic looks cheap next to Pro — that is intentional.'
            : 'See what you are missing on Free, and what Basic adds before Pro.'}
        </p>
        <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
          Join 13,000+ students at 15+ Ghanaian universities
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Basic from {basic.displayMonthly}/mo · decoy vs Pro:{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {basic.displaySemester} /sem vs {pro.displaySemester} /sem for full AI + tutor
          </span>
        </p>
      </header>

      <div className="mt-10">
        <PricingCards
          currentPlanId={currentPlanId}
          highlightPlanId="pro"
          onSelectPlan={onSelectPlan}
          context="page"
        />
      </div>

      <div className="mt-12 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-6 text-center dark:border-orange-900/50 dark:from-orange-950/30 dark:to-amber-950/20">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          “I passed all 5 courses this semester using {BRAND}.”
        </p>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          — Kwame A., Level 300, KNUST Computer Science
        </p>
      </div>
    </div>
  );
}
