/**
 * Canonical AbortError utilities for fetch/axios/query cancellation.
 * In Next.js + TanStack Query, aborts are expected and should not surface as app errors.
 */
export function isAbortError(error: unknown): boolean {
  if (typeof error === 'string') {
    const s = error.toLowerCase();
    return (
      s.includes('signal is aborted') ||
      s.includes('aborted without reason') ||
      s.includes('the user aborted') ||
      s.includes('the operation was aborted') ||
      s.includes('err_canceled') ||
      s.includes('cancelled') ||
      s.includes('canceled')
    );
  }

  let e: unknown = error;
  for (let depth = 0; depth < 6 && e != null; depth += 1) {
    if (typeof e !== 'object') break;
    const o = e as {
      name?: string;
      code?: string | number;
      message?: string;
      cause?: unknown;
    };
    if (o.name === 'AbortError' || o.name === 'CanceledError') return true;
    if (o.code === 'ERR_CANCELED' || o.code === 'ABORT_ERR' || o.code === 20) {
      return true;
    }
    const msg = typeof o.message === 'string' ? o.message : '';
    if (
      msg.includes('signal is aborted') ||
      msg.includes('signal has been aborted') ||
      msg.includes('The user aborted') ||
      msg.includes('The operation was aborted') ||
      /aborted without reason/i.test(msg) ||
      /cancelled|canceled/i.test(msg)
    ) {
      return true;
    }
    e = o.cause;
  }
  return false;
}

/**
 * Install once on the browser root.
 * Suppresses expected abort cancellations from bubbling into overlays / global errors.
 */
export function installAbortHandler(): () => void {
  if (typeof window === 'undefined') return () => {};

  const onRejection = (event: PromiseRejectionEvent) => {
    if (!isAbortError(event.reason)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (process.env.NODE_ENV === 'development') {
      const err = event.reason as { message?: string; stack?: string } | undefined;
      // Keep a low-noise breadcrumb in dev.
      console.debug('[AbortError caught and suppressed]', {
        message: err?.message,
        stack: err?.stack?.split('\n')[1]?.trim(),
      });
    }
  };

  const onWindowError = (event: ErrorEvent) => {
    if (!isAbortError(event.error)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  window.addEventListener('unhandledrejection', onRejection);
  window.addEventListener('error', onWindowError);
  return () => {
    window.removeEventListener('unhandledrejection', onRejection);
    window.removeEventListener('error', onWindowError);
  };
}
