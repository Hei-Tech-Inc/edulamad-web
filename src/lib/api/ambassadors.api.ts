import { apiClient } from '@/api/client';

export const ambassadorsApi = {
  apply: (dto?: { payoutInfo?: string }) => apiClient.post('/ambassadors/apply', dto),
  getMyProfile: (signal?: AbortSignal) => apiClient.get('/ambassadors/me', { signal }),
  getByUniversity: (
    universityId: string,
    params?: Record<string, unknown>,
    signal?: AbortSignal,
  ) =>
    apiClient.get(`/admin/universities/${universityId}/ambassadors`, { params, signal }),
  approve: (id: string) => apiClient.patch(`/admin/ambassadors/${id}/approve`),
  suspend: (id: string, reason: string) =>
    apiClient.patch(`/admin/ambassadors/${id}/suspend`, { reason }),
};
