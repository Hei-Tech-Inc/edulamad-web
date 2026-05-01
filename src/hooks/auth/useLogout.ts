import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { useAuthStore } from '@/stores/auth.store';
import { logoutOneSignal } from '@/lib/onesignal';
import { clearClientSession } from '@/lib/clear-client-session';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        await apiClient.post(API.auth.logout, { refreshToken });
      }
    },
    onSettled: async () => {
      void logoutOneSignal();
      await clearClientSession();
      void queryClient.clear();
    },
  });
}
