import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient, apiClientPublic } from '@/api/client';
import API from '@/api/endpoints';
import { AppApiError } from '@/lib/api-error';
import type { BillingPeriod } from '@/lib/pricing';
import {
  normalizePlansPayload,
  parseSubscribeResponse,
  resolveApiPlanIdForMarketingSlug,
  type MarketingPaidSlug,
} from '@/lib/subscription-checkout';
import { useAuthStore } from '@/stores/auth.store';
import type { SubscribeDto } from '@/api/types/subscriptions.dto';

/**
 * Starts Paystack checkout: `GET /subscriptions/plans` → `planId`, then
 * `POST /subscriptions/subscribe` (JWT) → redirect to `authorizationUrl`.
 * After Paystack, the app should call `GET /payments/verify/:reference` with the same JWT.
 */
export function useUpgrade() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const upgrade = useCallback(
    async (marketingPlanSlug: string, _billing: BillingPeriod) => {
      setError(null);
      if (marketingPlanSlug === 'free') return;

      const token = useAuthStore.getState().accessToken;
      if (!token) {
        const next = encodeURIComponent(
          router.asPath || '/profile/subscription',
        );
        await router.push(`/login?next=${next}`);
        return;
      }

      if (marketingPlanSlug !== 'basic' && marketingPlanSlug !== 'pro') {
        setError('Unknown plan.');
        return;
      }

      setIsProcessing(true);
      try {
        const { data: rawPlans } = await apiClientPublic.get<unknown>(
          API.subscriptions.plans,
        );
        const plans = normalizePlansPayload(rawPlans);
        const planId = resolveApiPlanIdForMarketingSlug(
          marketingPlanSlug as MarketingPaidSlug,
          plans,
        );
        if (!planId) {
          setError(
            'Could not match this plan to the server catalog. Refresh or check OpenAPI for plan fields.',
          );
          return;
        }

        if (typeof window === 'undefined') {
          setError('Checkout must run in the browser.');
          return;
        }
        const callbackUrl = `${window.location.origin}/profile/subscription`;

        const body: SubscribeDto = { planId, callbackUrl };
        const { data: rawSub } = await apiClient.post<unknown>(
          API.subscriptions.subscribe,
          body,
        );

        const { authorizationUrl } = parseSubscribeResponse(rawSub);
        await queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        window.location.assign(authorizationUrl);
      } catch (e) {
        setError(
          e instanceof AppApiError
            ? e.message
            : 'Checkout could not be started.',
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [router, queryClient],
  );

  return { upgrade, isProcessing, error, clearError };
}
