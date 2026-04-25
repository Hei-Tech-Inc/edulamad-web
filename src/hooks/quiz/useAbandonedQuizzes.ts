import { useQuery } from '@tanstack/react-query';
import { quizApi } from '@/lib/api/quiz.api';

export function useAbandonedQuizzes() {
  return useQuery({
    queryKey: ['quiz', 'abandoned'] as const,
    queryFn: ({ signal }) => quizApi.getAbandoned(signal),
    staleTime: 60 * 1000,
  });
}
