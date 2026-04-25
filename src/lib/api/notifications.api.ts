import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

export const notificationsApi = {
  registerDevice: async (dto: { oneSignalId: string; deviceType: string }) => {
    const { data } = await apiClient.post(API.notifications.registerDevice, dto);
    return data;
  },
  answerDailyQuestion: async (dto: { questionId: string; answer: string }) => {
    const { data } = await apiClient.post(API.notifications.answerDailyQuestion, dto);
    return data;
  },
};
