import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '@/lib/api/tags.api';

export function useQuestionTags(questionId: string | null) {
  return useQuery({
    queryKey: ['tags', 'question', questionId] as const,
    queryFn: ({ signal }) => tagsApi.getForQuestion(questionId!, signal),
    enabled: Boolean(questionId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCourseTags(courseId: string | null) {
  return useQuery({
    queryKey: ['tags', 'course', courseId] as const,
    queryFn: ({ signal }) => tagsApi.getByCourse(courseId!, signal),
    enabled: Boolean(courseId),
    staleTime: 10 * 60 * 1000,
  });
}

export function useAddTag(questionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tagName: string) => tagsApi.addToQuestion(questionId, { tagName }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tags', 'question', questionId] });
    },
  });
}
