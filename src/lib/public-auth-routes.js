/**
 * Marketing + auth + onboarding paths — unauthenticated access allowed.
 * Keep aligned with `AuthWrapper` in pages/_app.js.
 */

export const PUBLIC_AUTH_ROUTE_PATHS = [
  '/',
  '/login',
  '/signup',
  '/register',
  '/register-company', // legacy URL; Next redirects to /register
  '/pending-approval',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/pricing',
  '/payment/callback',
  '/developer/api-keys',
  '/developer/api-reference',
]

export function isPublicAuthRoute(pathname) {
  if (!pathname) return false
  return PUBLIC_AUTH_ROUTE_PATHS.includes(pathname)
}
