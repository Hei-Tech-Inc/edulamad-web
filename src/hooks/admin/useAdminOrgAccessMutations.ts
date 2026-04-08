import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';

/** POST /admin/roles — CreateRoleDto */
export function useCreateOrgRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      name: string;
      description?: string;
      organizationId?: string;
    }) => {
      const { data } = await apiClient.post<unknown>(
        API.admin.roles.list,
        body,
      );
      return data;
    },
    onSuccess: (_data, vars) => {
      if (vars.organizationId) {
        void qc.invalidateQueries({
          queryKey: queryKeys.admin.orgRoles(vars.organizationId),
        });
      }
    },
  });
}

/** POST /admin/organizations/:id/members — AddMemberDto */
export function useAddOrgMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      orgId: string;
      userId: string;
      roleId?: string;
    }) => {
      const { data } = await apiClient.post<unknown>(
        API.admin.organizations.members(input.orgId),
        {
          userId: input.userId,
          ...(input.roleId ? { roleId: input.roleId } : {}),
        },
      );
      return data;
    },
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({
        queryKey: queryKeys.admin.orgMembers(vars.orgId),
      });
      void qc.invalidateQueries({ queryKey: queryKeys.platform.all });
    },
  });
}
