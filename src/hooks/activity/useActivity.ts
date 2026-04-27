import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import { studentsApi } from '@/lib/api/students.api';

export function useActivityFeed(limit = 12) {
  return useQuery({
    queryKey: queryKeys.students.activityFeed({ limit }),
    queryFn: ({ signal }) => studentsApi.getActivity({ limit }, signal),
    staleTime: 60 * 1000,
  });
}

export function useActivityStats() {
  return useQuery({
    queryKey: queryKeys.students.activityStats,
    queryFn: ({ signal }) => studentsApi.getActivityStats(signal),
    staleTime: 60 * 1000,
  });
}
