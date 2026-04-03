import posthog from 'posthog-js'

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN

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

if (typeof window !== 'undefined' && token && !disabled) {
  posthog.init(token, {
    api_host: resolveApiHost(),
    ui_host: 'https://us.posthog.com',
    defaults: '2026-01-30',
    capture_exceptions: true,
    debug: process.env.NODE_ENV === 'development',
  })
}
