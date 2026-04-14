export type SubscriptionTier = 'free' | 'basic' | 'pro';

/**
 * Normalize `GET /subscriptions/me` payload (shape varies by backend).
 */
export function subscriptionTierFromMe(data: unknown): SubscriptionTier {
  if (!data || typeof data !== 'object') return 'free';
  const d = data as Record<string, unknown>;
  if (d.isPro === true) return 'pro';
  const plan = typeof d.plan === 'string' ? d.plan.toLowerCase() : '';
  const tier = typeof d.tier === 'string' ? d.tier.toLowerCase() : '';
  if (plan === 'pro' || tier === 'pro') return 'pro';
  if (plan === 'basic' || tier === 'basic') return 'basic';
  return 'free';
}

export function isPaidTier(tier: SubscriptionTier): boolean {
  return tier === 'basic' || tier === 'pro';
}
