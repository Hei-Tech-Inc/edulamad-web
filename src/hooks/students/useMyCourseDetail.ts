import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type { MyCourseDetailResponseDto } from '@/api/types/my-courses.types';

export function useMyCourseDetail(
  courseId: string,
  opts: { year: string; level: 100 | 200 | 300 | 400 },
) {
  return useQuery({
    queryKey: queryKeys.students.myCourseDetail({
      courseId,
      year: opts.year,
      level: opts.level,
    }),
    enabled: Boolean(courseId),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<MyCourseDetailResponseDto>(
        API.students.meCourse(courseId),
        {
          signal,
          params: { year: opts.year, level: opts.level },
        },
      );
      return data;
    },
  });
}
