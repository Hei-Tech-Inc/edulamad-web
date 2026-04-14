'use client';

import { useRouter } from 'next/router';
import { PricingPageShell } from '@/components/pricing/PricingPageShell';
import { useUpgrade } from '@/hooks/pricing/useUpgrade';
import { useSubscriptionWithTier } from '@/hooks/subscriptions/useSubscriptionMe';

export default function UpgradePageContent() {
  const router = useRouter();
  const { tier } = useSubscriptionWithTier();
  const { upgrade } = useUpgrade();

  return (
    <PricingPageShell
      variant="app"
      currentPlanId={tier}
      onSelectPlan={(planId, billing) => {
        if (planId === 'free') {
          void router.push('/dashboard');
          return;
        }
        void upgrade(planId, billing);
      }}
    />
  );
}
