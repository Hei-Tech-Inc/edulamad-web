import { AppApiError } from '@/lib/api-error';

export type MarketingPaidSlug = 'basic' | 'pro';

export function normalizePlansPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    for (const k of ['plans', 'data', 'items']) {
      const v = d[k];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

function pickPlanId(p: Record<string, unknown>): string | undefined {
  for (const k of ['_id', 'id']) {
    const v = p[k];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return undefined;
}

/**
 * Maps marketing slugs (pricing UI) to API plan ids from `GET /subscriptions/plans`.
 * Prefer matching OpenAPI plan fields (`name`, `slug`, etc.) when you regenerate types.
 */
export function resolveApiPlanIdForMarketingSlug(
  marketingSlug: MarketingPaidSlug,
  plans: unknown[],
): string | null {
  const re = marketingSlug === 'basic' ? /\bbasic\b/i : /\bpro\b/i;
  for (const raw of plans) {
    if (!raw || typeof raw !== 'object') continue;
    const p = raw as Record<string, unknown>;
    const id = pickPlanId(p);
    if (!id) continue;
    const name =
      typeof p.name === 'string'
        ? p.name
        : typeof p.title === 'string'
          ? p.title
          : '';
    const slug =
      typeof p.slug === 'string'
        ? p.slug
        : typeof p.code === 'string'
          ? p.code
          : '';
    const hay = `${name} ${slug}`.trim();
    if (slug.toLowerCase() === marketingSlug) return id;
    if (hay && re.test(hay)) return id;
  }
  return null;
}

export function parseSubscribeResponse(data: unknown): {
  authorizationUrl: string;
  reference: string;
} {
  if (!data || typeof data !== 'object') {
    throw new AppApiError(0, 'Invalid subscribe response from API.');
  }
  const d = data as Record<string, unknown>;
  const authorizationUrl =
    typeof d.authorizationUrl === 'string'
      ? d.authorizationUrl
      : typeof d.authorization_url === 'string'
        ? d.authorization_url
        : '';
  const reference =
    typeof d.reference === 'string'
      ? d.reference
      : typeof d.paystackReference === 'string'
        ? d.paystackReference
        : '';
  if (!authorizationUrl || !reference) {
    throw new AppApiError(
      0,
      'Subscribe response missing Paystack checkout URL or reference. Check OpenAPI at /api-json.',
    );
  }
  return { authorizationUrl, reference };
}
