import type { Pagination } from './common.types';

/** Row shape for GET /platform/organisations (defensive; align with Swagger when published). */
export interface PlatformOrganisationListItem {
  id: string;
  name?: string;
  slug?: string;
  status?: string;
  plan?: string;
  createdAt?: string;
  /** Present when org is soft-deleted (`withDeleted` / `includeDeleted`). */
  deletedAt?: string | null;
  [key: string]: unknown;
}

export interface PlatformOrganisationListBody {
  items: PlatformOrganisationListItem[];
  pagination: Pagination;
}

export function normalizePlatformOrganisationList(
  raw: unknown,
): PlatformOrganisationListBody {
  const emptyPag = (): Pagination => ({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.items)) {
      const p = o.pagination;
      const pagination =
        p && typeof p === 'object'
          ? {
              page: Number((p as Record<string, unknown>).page) || 1,
              limit: Number((p as Record<string, unknown>).limit) || 20,
              total: Number((p as Record<string, unknown>).total) || 0,
              pages: Number((p as Record<string, unknown>).pages) || 0,
            }
          : emptyPag();
      return {
        items: o.items as PlatformOrganisationListItem[],
        pagination,
      };
    }
  }

  if (Array.isArray(raw)) {
    const n = raw.length;
    return {
      items: raw as PlatformOrganisationListItem[],
      pagination: {
        page: 1,
        limit: Math.max(n, 20),
        total: n,
        pages: 1,
      },
    };
  }

  return { items: [], pagination: emptyPag() };
}

/** GET /platform/organisations/:orgId — backend may return org + users + site list + audit logs (field names vary). */
export interface PlatformOrganisationDetailBody {
  organisation?: Record<string, unknown>;
  organization?: Record<string, unknown>;
  users?: unknown[];
  sites?: unknown[];
  /** Legacy key from older APIs; normalised as `linkedSites` in the tenant UI. */
  farms?: unknown[];
  auditLogs?: unknown[];
  audit_logs?: unknown[];
  [key: string]: unknown;
}

export function normalizePlatformOrganisationDetail(
  raw: unknown,
): PlatformOrganisationDetailBody {
  if (raw && typeof raw === 'object') {
    return raw as PlatformOrganisationDetailBody;
  }
  return {};
}
