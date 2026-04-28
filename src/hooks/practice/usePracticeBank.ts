import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  practiceBankApi,
  type CreatePracticeQuestionDto,
} from '@/lib/api/practice-bank.api';

function pickList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const rec = data as Record<string, unknown>;
    for (const key of ['data', 'items', 'results', 'questions']) {
      if (Array.isArray(rec[key])) return rec[key] as unknown[];
    }
  }
  return [];
}

export function usePracticeQuestions(
  courseId: string | null,
  params?: {
    status?: 'pending' | 'approved' | 'rejected';
    tag?: string;
    limit?: number;
    cursor?: string;
  },
) {
  return useQuery({
    queryKey: ['practice-bank', 'course', courseId ?? '', params ?? {}],
    enabled: Boolean(courseId),
    queryFn: async ({ signal }) => {
      try {
        const { data } = await practiceBankApi.listByCourse(
          courseId as string,
          params,
          signal,
        );
        const rec = data as Record<string, unknown>;
        const nextCursor =
          typeof rec?.nextCursor === 'string'
            ? rec.nextCursor
            : typeof rec?.cursor === 'string'
              ? rec.cursor
              : null;
        return { data: pickList(data), nextCursor, mocked: false };
      } catch {
        return { data: [], nextCursor: null, mocked: true };
      }
    },
  });
}

export function useSubmitPracticeQuestion(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<CreatePracticeQuestionDto, 'courseId'>) =>
      practiceBankApi.submit({ ...payload, courseId }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['practice-bank', 'course', courseId] });
    },
  });
}

export function useSubmitPracticeSolution(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      id: string;
      correctAnswer?: string;
      explanation?: string;
      workedSolution?: string;
    }) => {
      const { id, ...dto } = payload;
      return practiceBankApi.submitSolution(id, dto);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['practice-bank', 'course', courseId] });
    },
  });
}
