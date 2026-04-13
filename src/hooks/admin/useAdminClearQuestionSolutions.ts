import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';

/**
 * DELETE /admin/questions/:questionId/solutions — admin tooling / re-seed (per OpenAPI).
 */
export function useAdminClearQuestionSolutions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (questionId: string) => {
      await apiClient.delete(API.admin.questionSolutions(questionId));
    },
    onSuccess: (_data, questionId) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.questions.solutions(questionId),
      });
    },
  });
}
