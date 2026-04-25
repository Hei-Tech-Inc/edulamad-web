import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

export type QuestionTag = {
  _id: string;
  name: string;
  usageCount?: number;
};

export const tagsApi = {
  getForQuestion: async (questionId: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<QuestionTag[]>(API.tags.byQuestion(questionId), { signal });
    return data;
  },
  addToQuestion: async (questionId: string, dto: { tagName: string }) => {
    const { data } = await apiClient.post(API.tags.byQuestion(questionId), dto);
    return data;
  },
  removeFromQuestion: async (questionId: string, tagId: string) => {
    const { data } = await apiClient.delete(API.tags.questionTag(questionId, tagId));
    return data;
  },
  getByCourse: async (courseId: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<QuestionTag[]>(API.tags.byCourse(courseId), { signal });
    return data;
  },
  search: async (q: string, courseId?: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<QuestionTag[]>(API.tags.search, {
      params: { q, courseId },
      signal,
    });
    return data;
  },
};
