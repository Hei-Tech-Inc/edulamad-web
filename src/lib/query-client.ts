import { isCancelledError, QueryClient } from '@tanstack/react-query';
import { isAbortLikeError } from '@/lib/abort-error';
import { isApiError } from '@/lib/api-error';

function isBenignCancellation(error: unknown): boolean {
  return isCancelledError(error) || isAbortLikeError(error);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
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
      onError: (error) => {
        if (isBenignCancellation(error)) return;
        if (process.env.NODE_ENV === 'development') {
          console.error('[mutation]', error);
        }
      },
    },
  },
});
