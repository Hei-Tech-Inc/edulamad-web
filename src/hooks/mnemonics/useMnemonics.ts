import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';

export type MnemonicDto = {
  _id: string;
  courseId: string;
  topic?: string;
  term: string;
  mnemonic: string;
  explanation?: string;
  example?: string;
  upvotes: number;
  isVerified?: boolean;
};

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export function useMnemonicsForCourse(
  courseId: string | undefined,
  topic: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: courseId
      ? queryKeys.mnemonics.course(courseId, topic)
      : ['mnemonics', 'none'],
    enabled: Boolean(courseId && enabled),
    queryFn: async ({ signal }) => {
      if (!courseId) return [];
      const { data } = await apiClient.get<unknown>(API.mnemonics.byCourse(courseId), {
        signal,
        params: topic?.trim() ? { topic: topic.trim() } : undefined,
      });
      return asArray<MnemonicDto>(data);
    },
    staleTime: 60_000,
  });
}

export function useSubmitMnemonic(courseId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      topic: string;
      term: string;
      mnemonic: string;
      explanation?: string;
      example?: string;
    }) => {
      if (!courseId) throw new Error('Missing course id');
      await apiClient.post(API.mnemonics.root, {
        courseId,
        topic: body.topic.trim(),
        term: body.term.trim(),
        mnemonic: body.mnemonic.trim(),
        explanation: body.explanation?.trim() || undefined,
        example: body.example?.trim() || undefined,
      });
    },
    onSuccess: () => {
      if (courseId) {
        void queryClient.invalidateQueries({
          queryKey: ['mnemonics', 'course', courseId],
        });
      }
    },
  });
}

export function useMnemonicUpvote(courseId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mnemonicId: string) => {
      await apiClient.post(API.mnemonics.upvote(mnemonicId));
    },
    onSuccess: () => {
      if (courseId) {
        void queryClient.invalidateQueries({
          queryKey: ['mnemonics', 'course', courseId],
        });
      }
    },
  });
}
