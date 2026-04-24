import { installAbortHandler, isAbortError } from '@/lib/abort-handler';

/**
 * Backward-compatible alias.
 * Prefer `isAbortError` from `@/lib/abort-handler`.
 */
export const isAbortLikeError = isAbortError;

/**
 * Backward-compatible alias.
 * Prefer `installAbortHandler` from `@/lib/abort-handler`.
 */
export function subscribeAbortUnhandledRejectionSilencer(): () => void {
  return installAbortHandler();
}
