import type { RequestUser } from '@/api/types/common.types';

/**
 * Supabase-shaped user for legacy components (Header, UserManagement, etc.).
 */
export interface CompatUser {
  id: string;
  email?: string;
  user_metadata: {
    full_name?: string | null;
    role?: string;
  };
}

export function toCompatUser(user: RequestUser | null): CompatUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    user_metadata: {
      full_name: user.name,
      role: user.role,
    },
  };
}
