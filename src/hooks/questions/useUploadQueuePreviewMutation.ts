import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

/**
 * GET /questions/uploads/:uploadQueueId/preview — signed URLs for PDF / extracted JSON (per OpenAPI summary).
 */
export function useUploadQueuePreviewMutation() {
  return useMutation({
    mutationFn: async (uploadQueueId: string) => {
      const { data } = await apiClient.get<unknown>(API.questions.uploadPreview(uploadQueueId));
      return data;
    },
  });
}
