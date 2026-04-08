import { useMutation } from '@tanstack/react-query';
import { apiClientPublic } from '@/api/client';
import API from '@/api/endpoints';

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (token: string) => {
      const { data } = await apiClientPublic.post<unknown>(API.auth.verifyEmail, {
        token,
      });
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
