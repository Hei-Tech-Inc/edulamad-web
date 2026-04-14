'use client';

import { useMemo, useState } from 'react';
import {
  PLANS,
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
};

/** Card order: Free → Pro (center, featured) → Basic (decoy). */
const VISUAL_ORDER: Array<'free' | 'pro' | 'basic'> = ['free', 'pro', 'basic'];

export function PricingCards({
  currentPlanId = 'free',
  highlightPlanId = 'pro',
  onSelectPlan,
  context = 'page',
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

      {context === 'page' ? (
        <>
          <FeatureComparisonTable />
          <PricingFAQ />
        </>
      ) : null}
    </div>
  );
}
