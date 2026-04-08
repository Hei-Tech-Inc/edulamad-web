import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type {
  CreatePlatformOrganisationDto,
  UpdatePlatformOrganisationDto,
} from '@/api/types/platform-organisation.dto';

/**
 * Platform tenant CRUD: `/platform/organisations*` for super-admins (avoids `organization:*` JWT on `/admin/organizations`).
 */

function stripEmptyStrings<T extends Record<string, unknown>>(body: T): T {
  const out = { ...body } as Record<string, unknown>;
  for (const k of Object.keys(out)) {
    if (out[k] === '') delete out[k];
  }
  return out as T;
}

export function useCreatePlatformOrganisation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreatePlatformOrganisationDto) => {
      const { data } = await apiClient.post<unknown>(
        API.platform.organisations,
        stripEmptyStrings(body as unknown as Record<string, unknown>),
      );
      return data;
    },
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: queryKeys.platform.all }),
  });
}

export function useUpdatePlatformOrganisation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      orgId: string;
      body: UpdatePlatformOrganisationDto;
    }) => {
      const { data } = await apiClient.put<unknown>(
        API.platform.organisation(input.orgId),
        stripEmptyStrings(input.body as unknown as Record<string, unknown>),
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.platform.all });
    },
  });
}

export function useDeletePlatformOrganisation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orgId: string) => {
      const { data } = await apiClient.delete<unknown>(
        API.platform.organisation(orgId),
      );
      return data;
    },
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: queryKeys.platform.all }),
  });
}
