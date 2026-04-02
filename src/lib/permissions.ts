import type {
  OrgRole,
  Permission,
  RequestUser,
} from '@/api/types/common.types';

export function hasPermission(
  user: RequestUser | null,
  permission: Permission,
): boolean {
  if (!user?.permissions?.length) return false;
  return user.permissions.includes(permission);
}

export function hasRole(
  user: RequestUser | null,
  role: OrgRole | OrgRole[],
): boolean {
  if (!user) return false;
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}

export function canApprove(
  user: RequestUser,
  record: { createdByUserId: string },
  approvePermission: Permission,
): boolean {
  return (
    user.id !== record.createdByUserId &&
    hasPermission(user, approvePermission)
  );
}
