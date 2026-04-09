import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { normalizeQuestionSolutionsPayload, pickAnySolutionText } from '@/lib/quiz/question-solutions';

export function useQuestionSolutions(questionId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: questionId ? queryKeys.questions.solutions(questionId) : ['questions', 'solutions', 'none'],
    enabled: Boolean(questionId && enabled),
    queryFn: async ({ signal }): Promise<string | null> => {
      if (!questionId) return null;
      const { data } = await apiClient.get<unknown>(API.questions.solutions(questionId), { signal });
      const rows = normalizeQuestionSolutionsPayload(data);
      return pickAnySolutionText(rows);
    },
    staleTime: 5 * 60_000,
  });
}
