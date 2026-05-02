import posthog from 'posthog-js'

function isAbortLikeError(err) {
  if (err == null || typeof err !== 'object') return false
  if (err.name === 'AbortError') return true
  if (err.name === 'CanceledError') return true
  if (err.code === 'ERR_CANCELED') return true
  return false
}

/** Never let product analytics throw into user-facing flows. */

export function safePosthogIdentify(distinctId, props) {
  if (typeof window === 'undefined') return
  try {
    posthog.identify(distinctId, props)
  } catch {
    /* ignore */
  }
}

export function safePosthogCapture(eventName, props) {
  if (typeof window === 'undefined') return
  try {
    posthog.capture(eventName, props)
  } catch {
    /* ignore */
  }
}

export function safePosthogCaptureException(err) {
  if (typeof window === 'undefined') return
  if (isAbortLikeError(err)) return
  try {
    if (typeof posthog.captureException === 'function') {
      posthog.captureException(err)
    }
  } catch {
    /* ignore */
  }
}

/**
 * Super-properties for all subsequent events (e.g. first-touch UTM). Never throws.
 */
export function safePosthogRegister(props) {
  if (typeof window === 'undefined') return
  if (!props || typeof props !== 'object') return
  try {
    if (typeof posthog.register === 'function') {
      posthog.register(props)
    }
  } catch {
    /* ignore */
  }
}
