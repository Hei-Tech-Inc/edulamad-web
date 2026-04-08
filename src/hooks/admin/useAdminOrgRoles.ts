import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
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

/** GET /admin/roles?organizationId= — OpenAPI AdminRolesController_findAll */
export function useAdminOrgRoles(organizationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.orgRoles(organizationId ?? ''),
    queryFn: async ({ signal }): Promise<AdminOrgRoleRow[]> => {
      if (!organizationId) return [];
      const { data: raw } = await apiClient.get<unknown>(API.admin.roles.list, {
        params: { organizationId },
        signal,
      });
      return normalizeRoles(raw);
    },
    enabled: Boolean(organizationId),
  });
}
