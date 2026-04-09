import { useQueries } from '@tanstack/react-query';
import type { QueryFunctionContext } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import {
  normalizeQuestionSolutionsPayload,
  type SolutionRow,
} from '@/lib/quiz/question-solutions';

export function useQuizSolutionRows(questionIds: readonly string[], enabled: boolean) {
  const queries = useQueries({
    queries: questionIds.map((id) => ({
      queryKey: queryKeys.questions.solutions(id),
      queryFn: async ({ signal }: QueryFunctionContext): Promise<SolutionRow[]> => {
        const { data } = await apiClient.get<unknown>(API.questions.solutions(id), { signal });
        return normalizeQuestionSolutionsPayload(data);
      },
      enabled: enabled && Boolean(id),
      staleTime: 5 * 60_000,
    })),
  });

  const byId: Record<string, SolutionRow[]> = {};
  for (let i = 0; i < questionIds.length; i++) {
    const id = questionIds[i];
    if (!id) continue;
    const d = queries[i]?.data;
    byId[id] = Array.isArray(d) ? d : [];
  }

  const isLoading = enabled && queries.some((q) => q.isLoading);
  const isFetching = enabled && queries.some((q) => q.isFetching);

  return { byId, isLoading, isFetching, queries };
}
