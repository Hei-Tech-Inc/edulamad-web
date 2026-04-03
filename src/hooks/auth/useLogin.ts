import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClientPublic } from '@/api/client';
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
      const { data: body } = await apiClientPublic.post<LoginResponse>(
        API.auth.login,
        data,
      );
      return body;
    },
    onSuccess: (res) => {
      useAuthStore.getState().setOrg(null);
      useAuthStore.getState().setTokens(res.accessToken, res.refreshToken);
      useAuthStore
        .getState()
        .setUser(mapAuthUserToRequestUser(res.user, res.accessToken));
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}
