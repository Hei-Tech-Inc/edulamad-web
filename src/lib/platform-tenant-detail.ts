import type { PlatformOrganisationDetailBody } from '@/api/types/platform.types';

const KNOWN_TOP_LEVEL = new Set([
  'organisation',
  'organization',
  'users',
  'members',
  'farms',
  'sites',
  'auditLogs',
  'audit_logs',
]);

export interface NormalizedPlatformTenantDetail {
  organisation: Record<string, unknown> | null;
  users: unknown[];
  /** Normalised from API `farms`, `sites`, or similar tenant-scoped lists. */
  linkedSites: unknown[];
  auditLogs: unknown[];
  /** Any other top-level keys from the API (full capture). */
  extraTopLevel: Record<string, unknown>;
}

export function normalizePlatformTenantDetailPayload(
  raw: PlatformOrganisationDetailBody | Record<string, unknown>,
): NormalizedPlatformTenantDetail {
  const data =
    raw && typeof raw === 'object'
      ? (raw as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const orgRaw = data.organisation ?? data.organization;
  const organisation =
    orgRaw && typeof orgRaw === 'object'
      ? (orgRaw as Record<string, unknown>)
      : null;

  const usersRaw = data.users ?? data.members;
  const users = Array.isArray(usersRaw) ? usersRaw : [];

  const sitesRaw = data.sites ?? data.farms;
  const linkedSites = Array.isArray(sitesRaw) ? sitesRaw : [];

  const auditRaw = data.auditLogs ?? data.audit_logs;
  const auditLogs = Array.isArray(auditRaw) ? auditRaw : [];

  const extraTopLevel: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (KNOWN_TOP_LEVEL.has(k)) continue;
    extraTopLevel[k] = v;
  }

  return { organisation, users, linkedSites, auditLogs, extraTopLevel };
}

/**
 * Merges list row (partial tenant) into detail organisation for display fallbacks.
 */
export function mergeOrganisationProfile(
  organisation: Record<string, unknown> | null,
  listRow: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!organisation && !listRow) return null;
  if (!listRow) return organisation;
  if (!organisation) return { ...listRow };
  return { ...listRow, ...organisation };
}
