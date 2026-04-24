import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  isCancel,
} from 'axios';
import { nanoid } from 'nanoid';
import API from '@/api/endpoints';
import type { ApiResponse } from '@/api/types/common.types';
import { getApiBaseURL } from '@/lib/api-base-url';
import { AppApiError, parseApiErrorPayload } from '@/lib/api-error';
import { isAbortError } from '@/lib/abort-handler';
import { useAuthStore } from '@/stores/auth.store';
import { loadingBarActions } from '@/stores/loading-bar.store';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _loadingBarTracked?: boolean;
    skipLoadingBar?: boolean;
  }
}

const baseURL = getApiBaseURL();

const DEFAULT_TIMEOUT_MS = 30_000;

const axiosDefaults = { baseURL, timeout: DEFAULT_TIMEOUT_MS } as const;

/** In-flight GET dedupe (same URL + params → one network call). */
const getInflight = new Map<string, Promise<AxiosResponse<unknown>>>();

function getDedupeKey(url: string, config?: AxiosRequestConfig): string {
  const p =
    config?.params && typeof config.params === 'object' && config.params !== null
      ? JSON.stringify(config.params)
      : '';
  return `${url}::${p}`;
}

/**
 * GET with request deduplication (TanStack Query already dedupes; this helps non-Query callers).
 */
export function apiClientGetDeduped<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  const key = getDedupeKey(url, config);
  const existing = getInflight.get(key);
  if (existing) {
    return existing as Promise<AxiosResponse<T>>;
  }
  const p = apiClient
    .get<T>(url, config)
    .finally(() => {
      getInflight.delete(key);
    }) as Promise<AxiosResponse<T>>;
  getInflight.set(key, p as Promise<AxiosResponse<unknown>>);
  return p;
}

/** Never send act-as on global admin / platform catalogue routes (Bearer-only semantics). */
function requestPathSkipsActAsHeader(config: InternalAxiosRequestConfig): boolean {
  const u = config.url ?? '';
  const path = u.startsWith('http') ? new URL(u).pathname : u;
  const normalized = path.replace(/^\//, '');
  return (
    normalized.startsWith('platform/') || normalized.startsWith('admin/')
  );
}

function isLegacyUnsupportedPath(config: InternalAxiosRequestConfig): boolean {
  const u = config.url ?? '';
  const path = u.startsWith('http') ? new URL(u).pathname : u;
  const normalized = path.replace(/^\//, '');
  return normalized.startsWith('organisations/');
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
const refreshClient = axios.create(axiosDefaults);
let inflightLoadingBarRequests = 0;
const loadingBarEnabled = process.env.NEXT_PUBLIC_ENABLE_TOP_LOADING_BAR === '1';

function shouldTrackLoadingBar(config: InternalAxiosRequestConfig): boolean {
  if (!loadingBarEnabled) return false;
  const skipByFlag = config.skipLoadingBar === true;
  const h = config.headers;
  const skipByHeader =
    Boolean(h && typeof h.get === 'function' && h.get('X-Skip-Loading-Bar') === '1') ||
    Boolean((h as Record<string, unknown>)?.['X-Skip-Loading-Bar'] === '1');
  return !skipByFlag && !skipByHeader;
}

function markRequestStart(config: InternalAxiosRequestConfig): void {
  if (!shouldTrackLoadingBar(config)) {
    config._loadingBarTracked = false;
    return;
  }
  config._loadingBarTracked = true;
  inflightLoadingBarRequests += 1;
  if (inflightLoadingBarRequests === 1) {
    loadingBarActions.start();
  }
}

function markRequestDone(config?: InternalAxiosRequestConfig, failed = false): void {
  if (!config?._loadingBarTracked) return;
  inflightLoadingBarRequests = Math.max(0, inflightLoadingBarRequests - 1);
  if (inflightLoadingBarRequests === 0) {
    if (failed) loadingBarActions.error();
    else loadingBarActions.done();
  }
}

/**
 * Unauthenticated API calls only (e.g. sign-up and sign-in).
 * Never attaches `Authorization`, so a stale session cannot break onboarding.
 */
export const apiClientPublic = axios.create(axiosDefaults);

apiClientPublic.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  markRequestStart(config);
  if (isLegacyUnsupportedPath(config)) {
    markRequestDone(config, true);
    throw new AppApiError(
      404,
      'This frontend route still references a legacy `/organisations/*` endpoint that is not available on this backend.',
      'LEGACY_ENDPOINT_BLOCKED',
    );
  }
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
    markRequestDone(response.config);
    response.data = unwrapEnvelope(response.data);
    return response;
  },
  async (error: AxiosError) => {
    markRequestDone(error.config, true);
    if (isCancel(error) || error.code === 'ERR_CANCELED' || isAbortError(error)) {
      return Promise.reject(error);
    }
    return Promise.reject(toAppError(error));
  },
);

export const apiClient = axios.create(axiosDefaults);

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  markRequestStart(config);
  if (isLegacyUnsupportedPath(config)) {
    markRequestDone(config, true);
    throw new AppApiError(
      404,
      'This frontend route still references a legacy `/organisations/*` endpoint that is not available on this backend.',
      'LEGACY_ENDPOINT_BLOCKED',
    );
  }
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
    !requestPathSkipsActAsHeader(config) &&
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
    markRequestDone(response.config);
    response.data = unwrapEnvelope(response.data);
    return response;
  },
  async (error: AxiosError) => {
    markRequestDone(error.config, true);
    if (isCancel(error) || error.code === 'ERR_CANCELED' || isAbortError(error)) {
      return Promise.reject(error);
    }
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
