/**
 * Aborted fetches (navigation, query cancellation, timeouts) should not be retried
 * or reported like real API failures.
 */
export function isAbortLikeError(error: unknown): boolean {
  let e: unknown = error;
  for (let depth = 0; depth < 6 && e != null; depth += 1) {
    if (typeof e !== 'object') break;
    const o = e as {
      name?: string;
      code?: string;
      message?: string;
      cause?: unknown;
    };
    if (o.name === 'AbortError') return true;
    if (o.name === 'CanceledError') return true;
    if (o.code === 'ERR_CANCELED') return true;
    const msg = typeof o.message === 'string' ? o.message : '';
    if (
      msg.includes('signal is aborted') ||
      msg.includes('The user aborted') ||
      msg.includes('The operation was aborted')
    ) {
      return true;
    }
    e = o.cause;
  }
  return false;
}

/**
 * Suppress unhandled AbortError rejections in all browser environments.
 * AbortController cancellations are expected when routes or query keys change;
 * they are not real errors and must not be reported to error trackers or shown
 * in the browser console / Next.js error overlay.
 */
export function subscribeAbortUnhandledRejectionSilencer(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const onRejection = (event: PromiseRejectionEvent) => {
    if (isAbortLikeError(event.reason)) {
      event.preventDefault();
    }
  };

  window.addEventListener('unhandledrejection', onRejection);
  return () => window.removeEventListener('unhandledrejection', onRejection);
}
