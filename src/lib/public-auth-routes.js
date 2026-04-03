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
  '/reset-password',
  '/verify-email',
  '/developer/api-keys',
]

export function isPublicAuthRoute(pathname) {
  if (!pathname) return false
  return PUBLIC_AUTH_ROUTE_PATHS.includes(pathname)
}
