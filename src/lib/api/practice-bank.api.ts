import { apiClient } from '@/api/client';

export type PracticeQuestionInput = {
  questionText: string;
  type: 'mcq' | 'essay' | 'short_answer';
  options?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  sourceNote?: string;
  sourceUrl?: string;
  relevanceNote?: string;
  tags?: string[];
  courseId?: string;
};

export type CreatePracticeQuestionDto = PracticeQuestionInput & {
  courseId: string;
};

export const practiceBankApi = {
  listByCourse: (
    courseId: string,
    params?: {
      status?: 'pending' | 'approved' | 'rejected';
      tag?: string;
      limit?: number;
      cursor?: string;
    },
    signal?: AbortSignal,
  ) =>
    apiClient.get(`/practice-bank/courses/${courseId}`, { params, signal }),

  submit: (dto: CreatePracticeQuestionDto) => apiClient.post('/practice-bank', dto),

  bulkUpload: (dto: { questions: PracticeQuestionInput[] }) =>
    apiClient.post('/practice-bank/bulk', dto),

  update: (id: string, dto: Partial<CreatePracticeQuestionDto>) =>
    apiClient.patch(`/practice-bank/${id}`, dto),

  delete: (id: string) => apiClient.delete(`/practice-bank/${id}`),

  submitSolution: (id: string, dto: unknown) =>
    apiClient.post(`/practice-bank/${id}/solutions`, dto),
};
