import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

export type RegisterDeviceResponse = {
  ok: true;
  idempotent: boolean;
  tokenId: string;
};

export const notificationsApi = {
  registerDevice: async (
    dto: { oneSignalId: string; deviceType: string },
  ): Promise<RegisterDeviceResponse> => {
    const { data } = await apiClient.post<unknown>(API.notifications.registerDevice, dto);
    const rec = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
    return {
      ok: true,
      idempotent: Boolean(rec.idempotent),
      tokenId: typeof rec.tokenId === 'string' ? rec.tokenId : '',
    };
  },
  answerDailyQuestion: async (dto: { questionId: string; answer: string }) => {
    const { data } = await apiClient.post(API.notifications.answerDailyQuestion, dto);
    return data;
  },
};
