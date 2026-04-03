/** Routes that render `components/Layout.js` (sidebar + header). Used to avoid duplicate data banners. */

const MAIN_LAYOUT_PATHS = new Set([
  '/dashboard',
  '/cages',
  '/biweekly-records',
  '/biweekly-entry',
  '/harvest',
  '/admin/company-registrations',
])

const MAIN_LAYOUT_PREFIXES = [
  '/cages/analytics',
  '/cages/maintenance',
  '/cages/harvest-ready',
  '/cages/active',
  '/cages/settings',
]

export function usesMainSidebarLayout(pathname) {
  if (!pathname) return false
  if (MAIN_LAYOUT_PATHS.has(pathname)) return true
  return MAIN_LAYOUT_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
}
