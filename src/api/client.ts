import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { nanoid } from 'nanoid';
import API from '@/api/endpoints';
import type { ApiResponse } from '@/api/types/common.types';
import { AppApiError } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth.store';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function unwrapEnvelope<T>(raw: unknown): T {
  if (
    raw &&
    typeof raw === 'object' &&
    'success' in raw &&
    (raw as ApiResponse<unknown>).success === true &&
    'data' in raw
  ) {
    return (raw as ApiResponse<T>).data;
  }
  return raw as T;
}

/** No auth interceptor — used for token refresh only. */
const refreshClient = axios.create({ baseURL });

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    const headers = config.headers;
    if (headers && typeof headers.set === 'function') {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  const h = config.headers;
  if (h && typeof h.set === 'function') {
    h.set('X-Request-ID', nanoid());
  } else {
    config.headers['X-Request-ID'] = nanoid();
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    response.data = unwrapEnvelope(response.data);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(toAppError(error));
      }

      try {
        const { data: raw } = await refreshClient.post(API.auth.refresh, {
          refreshToken,
        });
        const body = unwrapEnvelope<{
          accessToken: string;
          refreshToken?: string;
        }>(raw);
        const access = body.accessToken;
        const nextRefresh = body.refreshToken ?? refreshToken;
        useAuthStore.getState().setTokens(access, nextRefresh);
        const headers = originalRequest.headers;
        if (headers && typeof headers.set === 'function') {
          headers.set('Authorization', `Bearer ${access}`);
        } else {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        return apiClient(originalRequest);
      } catch {
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(toAppError(error));
      }
    }

    return Promise.reject(toAppError(error));
  },
);

function toAppError(error: AxiosError): AppApiError {
  if (!error.response) {
    return new AppApiError(0, 'Cannot connect to server');
  }

  const status = error.response.status;
  const data = error.response.data as Record<string, unknown> | undefined;

  let message =
    (typeof data?.message === 'string' ? data.message : undefined) ??
    error.message;
  let code: string | undefined;
  let details:
    | import('@/api/types/common.types').ValidationErrorDetail[]
    | undefined;

  const nested = data?.error;
  if (nested && typeof nested === 'object') {
    const err = nested as Record<string, unknown>;
    if (typeof err.message === 'string') message = err.message;
    if (typeof err.code === 'string') code = err.code;
    if (Array.isArray(err.details)) {
      details = err.details as import('@/api/types/common.types').ValidationErrorDetail[];
    }
  }

  if (Array.isArray(data?.details)) {
    details = data.details as import('@/api/types/common.types').ValidationErrorDetail[];
  }

  return new AppApiError(
    status,
    message || 'Request failed',
    code,
    details,
  );
}
