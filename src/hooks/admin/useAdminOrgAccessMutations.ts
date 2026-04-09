import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';

/** Backend contract currently has no /admin/roles route. */
export function useCreateOrgRole() {
  return useMutation({
    mutationFn: async () => {
      throw new Error('Role creation is unavailable on this backend.');
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
