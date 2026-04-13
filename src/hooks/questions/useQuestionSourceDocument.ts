import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import { isApiError } from '@/lib/api-error';
import { getQuestionSourceDocument } from '@/lib/api/resolve-signed-urls';

/**
 * GET /questions/:id/source-document — signed URL for original source document (shape not fully specified in OpenAPI).
 */
export function useQuestionSourceDocument(questionId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: questionId
      ? queryKeys.questions.sourceDocument(questionId)
      : ['questions', 'source-document', 'none'],
    enabled: Boolean(questionId && enabled),
    queryFn: async ({ signal }) => {
      if (!questionId) throw new Error('Missing question id');
      return getQuestionSourceDocument(questionId, signal);
    },
    staleTime: 5 * 60_000,
    retry: (count, err) => {
      if (isApiError(err) && (err.status === 403 || err.status === 404)) return false;
      return count < 2;
    },
  });
}
