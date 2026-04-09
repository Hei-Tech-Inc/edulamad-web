import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClientPublic } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { AppApiError } from '@/lib/api-error';
import {
  mapAuthUserToRequestUser,
  type LoginResponse,
  type RegisterDto,
  type RegisterResponse,
} from '@/api/types/auth.types';
import { useAuthStore } from '@/stores/auth.store';

export type RegisterMutationVariables = RegisterDto;

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: RegisterMutationVariables) => {
      const body: RegisterMutationVariables = {
        email: dto.email,
        password: dto.password,
        name: dto.name,
        ...(dto.referralCode?.trim()
          ? { referralCode: dto.referralCode.trim() }
          : {}),
      };
      const { data: regBody } = await apiClientPublic.post<RegisterResponse>(
        API.auth.register,
        body,
      );

      let accessToken = regBody?.accessToken;
      let refreshToken = regBody?.refreshToken;
      let user = regBody?.user;

      if (
        typeof accessToken !== 'string' ||
        typeof refreshToken !== 'string' ||
        !user ||
        typeof user !== 'object'
      ) {
        try {
          const res = await apiClientPublic.post<LoginResponse>(
            API.auth.login,
            { email: dto.email, password: dto.password },
          );
          accessToken = res.data.accessToken;
          refreshToken = res.data.refreshToken;
          user = res.data.user;
        } catch (loginErr) {
          const hint =
            loginErr instanceof AppApiError
              ? loginErr.message
              : 'Sign-in failed after registration.';
          throw new AppApiError(
            loginErr instanceof AppApiError ? loginErr.status : 0,
            `Your account was created, but we could not start your session: ${hint} Try signing in with the same email and password.`,
            loginErr instanceof AppApiError ? loginErr.code : undefined,
            loginErr instanceof AppApiError ? loginErr.details : undefined,
          );
        }
      }

      useAuthStore.getState().setOrg(null);
      useAuthStore.getState().setTokens(accessToken, refreshToken);
      useAuthStore
        .getState()
        .setUser(mapAuthUserToRequestUser(user, accessToken));
      if (regBody?.org && typeof regBody.org === 'object') {
        useAuthStore.getState().setOrg(regBody.org);
      }
      return {
        ...regBody,
        session: { accessToken, refreshToken, user },
        setupError: null as string | null,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}
