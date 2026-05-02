import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { extractOrgMembersList } from '@/lib/admin-org-members';

export interface AdminOrgMemberRow {
  id: string;
  userId?: string;
  organizationId?: string;
  roleId?: string | null;
  isActive?: boolean;
  user?: Record<string, unknown>;
  role?: Record<string, unknown>;
  [key: string]: unknown;
}

function normalizeMembers(raw: unknown): AdminOrgMemberRow[] {
  const list = extractOrgMembersList(raw);
  return list.filter(
    (r) => r && typeof r === 'object',
  ) as AdminOrgMemberRow[];
}

/** GET /admin/organizations/:id/members — OpenAPI OrganizationsController_getMembers */
export function useAdminOrgMembers(organizationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.orgMembers(organizationId ?? ''),
    queryFn: async ({ signal }): Promise<AdminOrgMemberRow[]> => {
      if (!organizationId) return [];
      const { data: raw } = await apiClient.get<unknown>(
        API.admin.organizations.members(organizationId),
        { signal },
      );
      return normalizeMembers(raw);
    },
    enabled: Boolean(organizationId),
  });
}
