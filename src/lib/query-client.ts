import { isCancelledError, QueryClient } from '@tanstack/react-query';
import { isAbortError } from '@/lib/abort-handler';
import { isApiError } from '@/lib/api-error';

function isBenignCancellation(error: unknown): boolean {
  return isCancelledError(error) || isAbortError(error);
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        throwOnError: false,
        retry: (failureCount, error) => {
          if (isBenignCancellation(error)) return false;
          if (isApiError(error) && [401, 403, 404].includes(error.status)) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
        throwOnError: false,
        onError: (error) => {
          if (isBenignCancellation(error)) return;
          if (process.env.NODE_ENV === 'development') {
            console.error('[mutation]', error);
          }
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Browser singleton QueryClient.
 * - Server: fresh instance per request
 * - Browser: one shared instance for app lifetime
 */
export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

/** Backward compatibility for existing imports. */
export const queryClient = getQueryClient();
