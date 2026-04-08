import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import {
  normalizePlatformOrganisationList,
  type PlatformOrganisationListBody,
} from '@/api/types/platform.types';

export function usePlatformOrganisations(filters: {
  page?: number;
  limit?: number;
  search?: string;
  /** When true, soft-deleted orgs are included (GET `?includeDeleted=true`). */
  includeDeleted?: boolean;
}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const search = filters.search?.trim() || undefined;
  const includeDeleted = filters.includeDeleted === true;

  return useQuery({
    queryKey: queryKeys.platform.organisations({
      page,
      limit,
      search,
      includeDeleted,
    }),
    queryFn: async ({ signal }): Promise<PlatformOrganisationListBody> => {
      const { data: raw } = await apiClient.get<unknown>(
        API.platform.organisations,
        {
          params: {
            page,
            limit,
            ...(search ? { search } : {}),
            ...(includeDeleted ? { includeDeleted: true } : {}),
          },
          signal,
        },
      );
      return normalizePlatformOrganisationList(raw);
    },
  });
}
