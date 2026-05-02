import { useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useAuthStore } from '@/stores/auth.store';
import { useIdleLogout, getIdleLogoutMs } from '@/hooks/auth/useIdleLogout';
import { useLogout } from '@/hooks/auth/useLogout';

/**
 * Logs the user out after a period of inactivity (default 15 minutes).
 * Configure with `NEXT_PUBLIC_IDLE_LOGOUT_MINUTES` (set to 0 to disable).
 */
export function IdleLogoutWatcher() {
  const { user } = useAuth();
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const logout = useLogout();
  const idleMs = getIdleLogoutMs();

  const onIdle = useCallback(() => {
    if (!user) return;
    return logout.mutateAsync();
  }, [logout, user]);

  const enabled = Boolean(
    idleMs !== null && hasHydrated && user,
  );

  useIdleLogout({ enabled, onIdle });

  return null;
}
