import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import { quizApi } from '@/lib/api/quiz.api';

export function useQuizHistory(params: { page?: number; limit?: number } = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  return useQuery({
    queryKey: queryKeys.quiz.history({ page, limit }),
    queryFn: ({ signal }) => quizApi.getHistory({ page, limit }, signal),
    staleTime: 30 * 1000,
  });
}
