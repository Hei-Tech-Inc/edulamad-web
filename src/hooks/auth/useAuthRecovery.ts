import { useMutation } from '@tanstack/react-query';
import { apiClient, apiClientPublic } from '@/api/client';
import API from '@/api/endpoints';

export type VerifyEmailInput =
  | string
  | { token: string; method?: 'get' | 'post' };

export function verifyEmailRequest(input: VerifyEmailInput) {
  const token = typeof input === 'string' ? input : input.token;
  const method = typeof input === 'string' ? 'post' : (input.method ?? 'post');
  if (method === 'get') {
    return apiClientPublic.get<unknown>(API.auth.verifyEmail, {
      params: { token },
    });
  }
  return apiClientPublic.post<unknown>(API.auth.verifyEmail, { token });
}

/** POST or GET `/auth/verify-email` — live OpenAPI may return new tokens + `user`. */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (input: VerifyEmailInput) => {
      const { data } = await verifyEmailRequest(input);
      return data;
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiClientPublic.post<unknown>(
        API.auth.resendVerification,
        { email },
      );
      return data;
    },
  });
}

/** POST `/auth/resend-verification/me` (Bearer JWT). */
export function useResendVerificationMe() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<unknown>(
        API.auth.resendVerificationMe,
        {},
      );
      return data;
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiClientPublic.post<unknown>(
        API.auth.forgotPassword,
        { email },
      );
      return data;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (input: { token: string; password: string }) => {
      const { data } = await apiClientPublic.post<unknown>(
        API.auth.resetPassword,
        input,
      );
      return data;
    },
  });
}
