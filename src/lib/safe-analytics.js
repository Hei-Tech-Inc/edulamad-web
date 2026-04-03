import posthog from 'posthog-js'

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
  try {
    if (typeof posthog.captureException === 'function') {
      posthog.captureException(err)
    }
  } catch {
    /* ignore */
  }
}
