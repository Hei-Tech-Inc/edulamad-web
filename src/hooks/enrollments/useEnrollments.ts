import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enrollmentsApi, type SetEnrollmentsDto } from '@/lib/api/enrollments.api';

export function useMyEnrollments() {
  return useQuery({
    queryKey: ['enrollments', 'me'] as const,
    queryFn: ({ signal }) => enrollmentsApi.getMyEnrollments(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSetEnrollments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SetEnrollmentsDto) => enrollmentsApi.setEnrollments(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['students', 'my-courses'] });
    },
  });
}
