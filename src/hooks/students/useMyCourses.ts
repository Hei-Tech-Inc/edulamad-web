import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type {
  MyCoursesContentFilter,
  MyCoursesListResponseDto,
  MyCoursesListSort,
  MyCoursesStatusFilter,
} from '@/api/types/my-courses.types';

const DEFAULT_LIMIT = 12;

export type UseMyCoursesInfiniteParams = {
  year: string;
  level: 100 | 200 | 300 | 400;
  search?: string;
  status?: MyCoursesStatusFilter;
  content?: MyCoursesContentFilter;
  sort?: MyCoursesListSort;
  limit?: number;
};

function buildListParams(
  page: number,
  p: UseMyCoursesInfiniteParams,
): Record<string, string | number | undefined> {
  const limit = p.limit ?? DEFAULT_LIMIT;
  return {
    page,
    limit,
    year: p.year,
    level: p.level,
    search: p.search?.trim() || undefined,
    status:
      p.status && p.status !== 'all' ? p.status : undefined,
    content:
      p.content && p.content !== 'all' ? p.content : undefined,
    sort: p.sort ?? 'title_asc',
  };
}

export function useMyCoursesInfinite(params: UseMyCoursesInfiniteParams) {
  const filterKey = {
    year: params.year,
    level: params.level,
    search: params.search?.trim() ?? '',
    status: params.status ?? 'all',
    content: params.content ?? 'all',
    sort: params.sort ?? 'title_asc',
    limit: params.limit ?? DEFAULT_LIMIT,
  };

  return useInfiniteQuery({
    queryKey: queryKeys.students.myCoursesInfinite(filterKey),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }): Promise<MyCoursesListResponseDto> => {
      const { data } = await apiClient.get<MyCoursesListResponseDto>(API.students.meCourses, {
        signal,
        params: buildListParams(pageParam as number, params),
      });
      return data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.page + 1 : undefined,
  });
}
