import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';

/**
 * Navigates to in-app subscription flow. The backend OpenAPI in this repo lists
 * `GET /subscriptions/plans` and `GET /subscriptions/me` but does not expose a
 * documented Paystack initialization endpoint — checkout is completed server-side
 * (webhook). We deep-link to Subscription with plan intent for when payment UI lands.
 */
export function useUpgrade() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const upgrade = useCallback(
    async (planId: string, billing: 'monthly' | 'semester') => {
      setIsProcessing(true);
      try {
        const q = new URLSearchParams();
        q.set('plan', planId);
        q.set('billing', billing);
        await router.push(`/profile/subscription?${q.toString()}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [router],
  );

  return { upgrade, isProcessing };
}
