'use client';

import { PricingPageShell } from '@/components/pricing/PricingPageShell';
import { useUpgrade } from '@/hooks/pricing/useUpgrade';
import { useSubscriptionWithTier } from '@/hooks/subscriptions/useSubscriptionMe';

export function PricingSubscriptionSection() {
  const { tier } = useSubscriptionWithTier();
  const { upgrade } = useUpgrade();

  return (
    <div className="mb-8">
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
