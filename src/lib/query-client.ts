import { isCancelledError, QueryClient } from '@tanstack/react-query';
import { isAbortLikeError } from '@/lib/abort-error';
import { isApiError } from '@/lib/api-error';

function isBenignCancellation(error: unknown): boolean {
  return isCancelledError(error) || isAbortLikeError(error);
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

/** Shared client for the browser app (Pages Router). */
export const queryClient = makeQueryClient();
