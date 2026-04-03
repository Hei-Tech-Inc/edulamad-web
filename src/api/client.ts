import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { nanoid } from 'nanoid';
import API from '@/api/endpoints';
import type { ApiResponse } from '@/api/types/common.types';
import { AppApiError, parseApiErrorPayload } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth.store';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

/**
 * Browser: use same-origin `/api/backend` when env points at localhost so Next
 * rewrites avoid CORS (typical dev: Next on :3001, API on :3000).
 * Server/SSR: call the API directly.
 */
function getApiBaseURL(): string {
  const envRaw = process.env.NEXT_PUBLIC_API_URL?.trim();
  const env = envRaw?.replace(/\/$/, '') ?? '';
  const devDefault = 'http://127.0.0.1:5001';

  if (typeof window === 'undefined') {
    return env || devDefault;
  }

  if (!env) {
    return '/api/backend';
  }

  try {
    const { hostname } = new URL(env);
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api/backend';
    }
  } catch {
    return '/api/backend';
  }

  return env;
}

const baseURL = getApiBaseURL();

/** Never send act-as on platform-admin catalogue routes. */
function requestPathIsPlatformAdmin(config: InternalAxiosRequestConfig): boolean {
  const u = config.url ?? '';
  const path = u.startsWith('http') ? new URL(u).pathname : u;
  const normalized = path.replace(/^\//, '');
  return normalized.startsWith('platform/');
}

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

/**
 * Unauthenticated API calls only (`/auth/register`, `/auth/login`, etc.).
 * Never attaches `Authorization`, so a stale session cannot break onboarding.
 */
export const apiClientPublic = axios.create({ baseURL });

apiClientPublic.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const h = config.headers;
  if (h && typeof h.set === 'function') {
    h.set('X-Request-ID', nanoid());
  } else {
    config.headers['X-Request-ID'] = nanoid();
  }
  return config;
});

apiClientPublic.interceptors.response.use(
  (response: AxiosResponse) => {
    response.data = unwrapEnvelope(response.data);
    return response;
  },
  async (error: AxiosError) => Promise.reject(toAppError(error)),
);

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

  const state = useAuthStore.getState();
  const actAs = state.actAsOrgId;
  if (
    actAs &&
    !requestPathIsPlatformAdmin(config) &&
    state.user?.isPlatformSuperAdmin
  ) {
    if (h && typeof h.set === 'function') {
      h.set('X-Act-As-Org-Id', actAs);
    } else {
      config.headers['X-Act-As-Org-Id'] = actAs;
    }
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
    const code = error.code ?? '';
    const viaProxy =
      typeof window !== 'undefined' && baseURL.startsWith('/');
    const msg = viaProxy
      ? `Cannot reach API (dev proxy). ${code || error.message || 'No response'}. Is the backend running? For Docker, set API_PROXY_TARGET (see .env.example).`
      : `Cannot connect to API (${code || error.message}). Check NEXT_PUBLIC_API_URL, CORS, and that the server is running.`;
    return new AppApiError(0, msg);
  }

  const status = error.response.status;
  const parsed = parseApiErrorPayload(error.response.data, status);
  return new AppApiError(
    status,
    parsed.message,
    parsed.code,
    parsed.details,
  );
}
