import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import {
  mapAuthUserToRequestUser,
  type LoginDto,
  type LoginResponse,
} from '@/api/types/auth.types';
import { useAuthStore } from '@/stores/auth.store';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginDto) => {
      const { data: body } = await apiClient.post<LoginResponse>(
        API.auth.login,
        data,
      );
      return body;
    },
    onSuccess: (res) => {
      useAuthStore.getState().setTokens(res.accessToken, res.refreshToken);
      useAuthStore.getState().setUser(mapAuthUserToRequestUser(res.user));
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}
