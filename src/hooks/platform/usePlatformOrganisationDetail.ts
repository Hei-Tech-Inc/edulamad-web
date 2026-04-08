import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import {
  normalizePlatformOrganisationDetail,
  type PlatformOrganisationDetailBody,
} from '@/api/types/platform.types';

export function usePlatformOrganisationDetail(
  orgId: string | undefined,
  options?: { includeDeleted?: boolean },
) {
  const includeDeleted = options?.includeDeleted === true;

  return useQuery({
    queryKey: queryKeys.platform.organisation(orgId ?? '', { includeDeleted }),
    queryFn: async ({
      signal,
    }): Promise<PlatformOrganisationDetailBody> => {
      if (!orgId) throw new Error('Missing organisation id');
      const { data: raw } = await apiClient.get<unknown>(
        API.platform.organisation(orgId),
        {
          params: includeDeleted ? { includeDeleted: true } : undefined,
          signal,
        },
      );
      return normalizePlatformOrganisationDetail(raw);
    },
    enabled: Boolean(orgId),
  });
}
