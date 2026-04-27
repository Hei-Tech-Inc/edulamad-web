import { useQuery } from '@tanstack/react-query';
import { apiClientPublic } from '@/api/client';
import API from '@/api/endpoints';
import { normalizePlansPayload } from '@/lib/subscription-checkout';

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscriptions', 'plans'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClientPublic.get<unknown>(
        API.subscriptions.plans,
        { signal },
      );
      return normalizePlansPayload(data);
    },
    staleTime: 5 * 60_000,
  });
}
