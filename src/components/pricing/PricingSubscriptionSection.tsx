'use client';

import { PricingPageShell } from '@/components/pricing/PricingPageShell';
import { useUpgrade } from '@/hooks/pricing/useUpgrade';
import { useSubscriptionWithTier } from '@/hooks/subscriptions/useSubscriptionMe';

export function PricingSubscriptionSection() {
  const { tier } = useSubscriptionWithTier();
  const { upgrade, error } = useUpgrade();

  return (
    <div className="mb-8">
      {error ? (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
          {error}
        </div>
      ) : null}
      <PricingPageShell
        variant="app"
        currentPlanId={tier}
        onSelectPlan={(planId, billing) => {
          if (planId === 'free') return;
          void upgrade(planId, billing);
        }}
      />
    </div>
  );
}
