import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import {
  subscriptionTierFromMe,
  type SubscriptionTier,
} from '@/lib/subscription-tier';

export function useSubscriptionMe() {
  return useQuery({
    queryKey: ['subscriptions', 'me'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.subscriptions.me, {
        signal,
      });
      return data && typeof data === 'object' ? data : {};
    },
    staleTime: 60_000,
  });
}

/** Single query + derived tier for gating upgrade UI. */
export function useSubscriptionWithTier() {
  const q = useSubscriptionMe();
  const tier: SubscriptionTier = subscriptionTierFromMe(q.data);
  return { ...q, tier };
}
