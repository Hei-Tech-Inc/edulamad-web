import type { RequestUser } from '@/api/types/common.types';
import {
  appRoleFromAccessToken,
  isPlatformSuperAdminFromAccessToken,
  roleStringsFromAccessToken,
} from '@/lib/jwt-payload';

/** JWT `appRole` values that may use in-app staff tools (catalog, uploads, dev docs). */
const STAFF_APP_ROLES = new Set(['admin', 'ta']);

/** Explicit org / app roles we treat as dashboard-admin (matches Dashboard / Sidebar behaviour). */
const PRIVILEGED_ROLES = new Set([
  'owner',
  'admin',
  'manager',
  'super_admin',
  'superadmin',
  'org_admin',
  'organisation_admin',
  'organization_admin',
]);

/** Student-like roles must never unlock admin/staff UI. */
const STUDENT_ROLES = new Set([
  'student',
  'learner',
  'candidate',
  'role_student',
]);

function roleStringsGrantAdmin(roles: readonly string[]): boolean {
  for (const raw of roles) {
    const r = raw.toLowerCase();
    if (PRIVILEGED_ROLES.has(r)) return true;
    const strip = r.replace(/^role_/i, '').replace(/^authority_/i, '');
    if (PRIVILEGED_ROLES.has(strip)) return true;
    if (strip.includes('admin') && (strip.includes('org') || strip.includes('organ')))
      return true;
  }
  return false;
}

/**
 * True when the session may see staff-only UI (dashboard admin panel, Developer + Admin sidebar).
 *
 * - Honors JWT `appRole`: **`student` never** gets staff UI (avoids false positives from org permissions).
 * - Staff when `appRole` is `admin` or `ta`, or legacy org roles in {@link roleStringsGrantAdmin}.
 * - Does **not** infer access from loose permission-string matching (that incorrectly included students).
 *
 * Optional `NEXT_PUBLIC_FORCE_ADMIN_UI=1` for local debugging.
 */
export function sessionHasAdminTools(
  user: RequestUser | null | undefined,
  accessToken: string | null | undefined,
): boolean {
  if (
    typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_FORCE_ADMIN_UI === '1'
  ) {
    return true;
  }

  if (user?.isPlatformSuperAdmin === true) return true;
  if (isPlatformSuperAdminFromAccessToken(accessToken)) return true;

  const userRole = String(user?.role || '')
    .trim()
    .toLowerCase();
  if (userRole && STUDENT_ROLES.has(userRole)) return false;

  const appRole = appRoleFromAccessToken(accessToken);
  if (appRole && STUDENT_ROLES.has(appRole)) return false;
  if (appRole && STAFF_APP_ROLES.has(appRole)) return true;

  const mergedRoles = [
    ...new Set([
      userRole,
      ...roleStringsFromAccessToken(accessToken),
    ]),
  ].filter(Boolean);
  if (mergedRoles.some((role) => STUDENT_ROLES.has(role))) return false;
  if (roleStringsGrantAdmin(mergedRoles)) return true;

  return false;
}
