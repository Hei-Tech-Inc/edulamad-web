/** Routes that render `components/Layout.js` (sidebar + header). */

const MAIN_LAYOUT_PATHS = new Set(['/dashboard', '/admin/company-registrations'])

const MAIN_LAYOUT_PREFIXES = ['/platform/organisations', '/platform/institutions']

export function usesMainSidebarLayout(pathname) {
  if (!pathname) return false
  if (MAIN_LAYOUT_PATHS.has(pathname)) return true
  return MAIN_LAYOUT_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
}
