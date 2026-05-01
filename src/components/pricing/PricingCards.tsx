'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  getPlan,
  semesterSavingPercent,
  type BillingPeriod,
} from '@/lib/pricing';
import { BillingToggle } from '@/components/pricing/BillingToggle';
import { PlanCard } from '@/components/pricing/PlanCard';
import { FeatureComparisonTable } from '@/components/pricing/FeatureComparisonTable';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';

type Context = 'page' | 'modal' | 'dashboard-banner';

type Props = {
  currentPlanId?: string;
  highlightPlanId?: string;
  onSelectPlan?: (planId: string, billing: BillingPeriod) => void;
  context?: Context;
  /** Full /pricing page only; hide comparison + FAQ on embedded surfaces (e.g. homepage). */
  showComparisonAndFaq?: boolean;
  /** Tighter billing toggle spacing for homepage embed. */
  compactToggle?: boolean;
};

/** Card order: Free → Pro (center, featured) → Basic (decoy). */
const VISUAL_ORDER: Array<'free' | 'pro' | 'basic'> = ['free', 'pro', 'basic'];

export function PricingCards({
  currentPlanId = 'free',
  highlightPlanId = 'pro',
  onSelectPlan,
  context = 'page',
  showComparisonAndFaq = true,
  compactToggle = false,
}: Props) {
  const [billing, setBilling] = useState<BillingPeriod>('semester');
  const urgencyLabel =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_PRICING_URGENCY_LABEL?.trim() || null
      : null;

  const savePercentMax = useMemo(() => {
    const pBasic = semesterSavingPercent(getPlan('basic'));
    const pPro = semesterSavingPercent(getPlan('pro'));
    return Math.max(pBasic ?? 0, pPro ?? 0, 15);
  }, []);

  const orderedPlans = useMemo(
    () => VISUAL_ORDER.map((id) => getPlan(id)),
    [],
  );

  return (
    <div>
      <BillingToggle
        value={billing}
        onChange={setBilling}
        savePercentMax={savePercentMax}
        compact={compactToggle}
      />

      <div
        className={
          context === 'dashboard-banner'
            ? 'grid gap-4 md:grid-cols-3'
            : 'grid grid-cols-1 items-start gap-6 md:grid-cols-3'
        }
      >
        {orderedPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billing={billing}
            isCurrent={plan.id === currentPlanId}
            isHighlighted={plan.id === highlightPlanId}
            urgencyLabel={urgencyLabel}
            onSelect={() => onSelectPlan?.(plan.id, billing)}
          />
        ))}
      </div>

      {context === 'page' && showComparisonAndFaq ? (
        <>
          <FeatureComparisonTable />
          <PricingFAQ />
        </>
      ) : null}

      {context === 'page' && !showComparisonAndFaq ? (
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-[var(--border-default)] pt-8 text-center">
          <p className="text-sm font-medium text-text-secondary">
            Need the full feature matrix or billing FAQs?
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-bg-raised px-5 py-2.5 text-sm font-semibold text-text-primary shadow-sm transition hover:border-teal-500/30 hover:bg-bg-hover dark:hover:border-teal-500/25"
          >
            View full pricing page
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
