import posthog from 'posthog-js'
import type { CaptureResult } from 'posthog-js'
import { captureRouterTransitionStart } from '@sentry/nextjs'

/** Client bundle only — do not put this on `instrumentation.ts` (Node resolves the server export). */
export const onRouterTransitionStart = captureRouterTransitionStart

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN

/** Drop benign request aborts from autocapture (navigation, timeouts, query cancel). */
function shouldDropExceptionEvent(cr: CaptureResult): boolean {
  if (cr.event !== '$exception') return false
  const props = cr.properties
  if (!props || typeof props !== 'object') return false
  const rec = props as Record<string, unknown>
  if (rec.$exception_type === 'AbortError') return true
  const msg = String(rec.$exception_message ?? '')
  if (msg.includes('signal is aborted')) return true
  if (msg.includes('The user aborted')) return true
  if (msg.includes('The operation was aborted')) return true
  return false
}

const disabled =
  process.env.NEXT_PUBLIC_POSTHOG_DISABLED === '1' ||
  process.env.NEXT_PUBLIC_POSTHOG_DISABLED === 'true'

/**
 * Production uses `/ingest` → next.config rewrites (same-origin, fewer adblock issues).
 * Development uses the real PostHog host so the browser sends events directly; otherwise
 * Next.js proxies `/ingest` from the dev server and can ETIMEDOUT while flooding the terminal.
 */
function resolveApiHost(): string {
  const explicit = process.env.NEXT_PUBLIC_POSTHOG_API_HOST
  if (explicit) return explicit

  if (process.env.NODE_ENV === 'development') {
    return 'https://us.i.posthog.com'
  }

  return '/ingest'
}

const appNameForAnalytics =
  process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'Edulamad'

if (typeof window !== 'undefined' && token && !disabled) {
  posthog.init(token, {
    api_host: resolveApiHost(),
    ui_host: 'https://us.posthog.com',
    defaults: '2026-01-30',
    capture_exceptions: true,
    // Runtime safety: avoid loading posthog-recorder.js, which can crash React 19 clients.
    disable_session_recording: true,
    loaded: (ph) => {
      ph.register({
        app_name: appNameForAnalytics,
      })
    },
    before_send: (cr) => {
      if (cr && shouldDropExceptionEvent(cr)) return null
      return cr
    },
    debug: process.env.NODE_ENV === 'development',
  })
}
