/**
 * Aborted fetches (navigation, query cancellation, timeouts) should not be retried
 * or reported like real API failures.
 */
export function isAbortLikeError(error: unknown): boolean {
  if (error == null || typeof error !== 'object') return false;
  const e = error as { name?: string; code?: string };
  if (e.name === 'AbortError') return true;
  if (e.name === 'CanceledError') return true;
  if (e.code === 'ERR_CANCELED') return true;
  return false;
}
