/**
 * API key scopes for the developer keys UI.
 * Align with your backend when `/api-keys` is documented in OpenAPI.
 */

export const API_KEY_SCOPES = [
  'user.profile.read',
  'user.profile.update',
  'institutions.read',
  'institutions.write',
  'questions.read',
  'questions.write',
  'questions.verify',
  'solutions.read',
  'solutions.write',
  'exams.simulations.read',
  'exams.simulations.write',
  'ai.chat',
  'ai.complete',
  'bookmarks.read',
  'bookmarks.write',
  'flashcards.read',
  'flashcards.write',
  'timetables.read',
  'timetables.write',
  'subscriptions.read',
  'analytics.read',
  'notifications.read',
  'org.read',
  'org.update',
  'users.read',
  'audit_logs.read',
] as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

export interface CreateApiKeyPayload {
  name: string;
  scopes: string[];
  rateLimitPerDay?: number;
  expiresAt?: string | null;
}

/** Listed keys — never includes full secret per API. */
export interface ApiKeySummary {
  id: string;
  name: string;
  scopes?: string[];
  keyPrefix?: string;
  prefix?: string;
  rateLimitPerDay?: number;
  expiresAt?: string | null;
  createdAt?: string;
  lastUsedAt?: string | null;
  isActive?: boolean;
}

/** Create response — `key` is returned only once. */
export interface ApiKeyCreated extends ApiKeySummary {
  key?: string;
}

export function scopeGroup(scope: string): string {
  const i = scope.indexOf('.');
  return i === -1 ? 'other' : scope.slice(0, i);
}

export function normalizeApiKeyList(raw: unknown): ApiKeySummary[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as ApiKeySummary[];
  if (typeof raw === 'object' && raw !== null && 'items' in raw) {
    const items = (raw as { items: unknown }).items;
    if (Array.isArray(items)) return items as ApiKeySummary[];
  }
  return [];
}
