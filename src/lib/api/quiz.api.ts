import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

export const quizApi = {
  getAbandoned: async (signal?: AbortSignal) => {
    const { data } = await apiClient.get(API.quiz.abandoned, { signal });
    return data;
  },
  resume: async (id: string) => {
    const { data } = await apiClient.post(API.quiz.resume(id));
    return data;
  },
};
