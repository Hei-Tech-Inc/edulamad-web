import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { useAuthStore } from '@/stores/auth.store';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        await apiClient.post(API.auth.logout, { refreshToken });
      }
    },
    onSettled: () => {
      useAuthStore.getState().clearAuth();
      void queryClient.clear();
    },
  });
}
