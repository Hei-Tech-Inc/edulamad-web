import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';

export interface AdminOrgRoleRow {
  id: string;
  name?: string;
  description?: string;
  organizationId?: string | null;
  isSystem?: boolean;
  [key: string]: unknown;
}

function normalizeRoles(raw: unknown): AdminOrgRoleRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((r) => r && typeof r === 'object') as AdminOrgRoleRow[];
}

/** Backend contract currently has no /admin/roles route; return empty roles. */
export function useAdminOrgRoles(organizationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.orgRoles(organizationId ?? ''),
    queryFn: async (): Promise<AdminOrgRoleRow[]> => {
      if (!organizationId) return [];
      return normalizeRoles([]);
    },
    enabled: Boolean(organizationId),
  });
}
