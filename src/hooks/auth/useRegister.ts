import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, apiClientPublic } from '@/api/client';
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

export type RegisterMutationVariables = RegisterDto & {
  /** When set, POST /farms after tokens are stored (same as `AuthContext.signUpWithEmail`). */
  createDefaultFarm?: string | boolean;
};

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: RegisterMutationVariables) => {
      const { createDefaultFarm, ...dto } = vars;
      const { data: regBody } = await apiClientPublic.post<RegisterResponse>(
        API.auth.register,
        dto,
      );
      let loginBody: LoginResponse;
      try {
        const res = await apiClientPublic.post<LoginResponse>(
          API.auth.login,
          { email: dto.email, password: dto.password },
        );
        loginBody = res.data;
      } catch (loginErr) {
        const hint =
          loginErr instanceof AppApiError
            ? loginErr.message
            : 'Login failed after registration.';
        throw new AppApiError(
          loginErr instanceof AppApiError ? loginErr.status : 0,
          `Your organisation was created, but sign-in failed: ${hint} Try signing in with the same email and password.`,
          loginErr instanceof AppApiError ? loginErr.code : undefined,
          loginErr instanceof AppApiError ? loginErr.details : undefined,
        );
      }
      useAuthStore.getState().setTokens(
        loginBody.accessToken,
        loginBody.refreshToken,
      );
      useAuthStore
        .getState()
        .setUser(
          mapAuthUserToRequestUser(loginBody.user, loginBody.accessToken),
        );
      if (regBody.org && typeof regBody.org === 'object') {
        useAuthStore.getState().setOrg(regBody.org);
      }
      if (
        createDefaultFarm !== undefined &&
        createDefaultFarm !== null &&
        createDefaultFarm !== false
      ) {
        const farmName =
          typeof createDefaultFarm === 'string' && createDefaultFarm.trim()
            ? createDefaultFarm.trim()
            : 'Main farm';
        try {
          await apiClient.post(API.farms.create, { name: farmName });
        } catch (e) {
          const message =
            e instanceof AppApiError
              ? e.message
              : 'Could not create your first farm.';
          return { ...regBody, session: loginBody, farmCreateError: message };
        }
      }
      return { ...regBody, session: loginBody, farmCreateError: null };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}
