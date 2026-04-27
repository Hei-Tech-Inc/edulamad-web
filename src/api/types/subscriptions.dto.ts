/**
 * `SubscribeDto` from live OpenAPI (`components.schemas.SubscribeDto`).
 * Regenerate or sync when `contexts/api-docs.json` is updated.
 */
export interface SubscribeDto {
  /** Convex `subscriptionPlans` document id (from `GET /subscriptions/plans`). */
  planId: string;
  /** Paystack return URL; required by the API. */
  callbackUrl: string;
}
