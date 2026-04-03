/** From OpenAPI `CreateApiKeyDto.scopes.items.enum` — keep in sync with `contexts/api-docs.json`. */

export const API_KEY_SCOPES = [
  'org.read',
  'org.update',
  'org.delete',
  'users.invite',
  'users.read',
  'users.update_role',
  'users.deactivate',
  'farms.read',
  'farms.create',
  'farms.update',
  'farms.delete',
  'units.read',
  'units.create',
  'units.update',
  'units.delete',
  'stocking.read',
  'stocking.create',
  'stocking.approve',
  'daily_records.read',
  'daily_records.create',
  'daily_records.update',
  'daily_records.delete',
  'biweekly.read',
  'biweekly.create',
  'biweekly.approve',
  'harvests.read',
  'harvests.create',
  'harvests.approve',
  'feed.read',
  'feed.manage',
  'finance.read',
  'reports.read',
  'reports.export',
  'audit_logs.read',
  'research.read',
  'research.export',
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
  if (
    typeof raw === 'object' &&
    raw !== null &&
    'data' in raw &&
    typeof (raw as { data: unknown }).data === 'object' &&
    (raw as { data: { items?: unknown } }).data !== null
  ) {
    const d = (raw as { data: { items?: unknown } }).data;
    if (Array.isArray(d.items)) return d.items as ApiKeySummary[];
  }
  return [];
}
