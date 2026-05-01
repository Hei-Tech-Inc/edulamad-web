import { signOut } from 'next-auth/react';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Clears API tokens in Zustand and signs out of NextAuth so OAuthSessionSync cannot
 * resurrect stale sessions after refresh failures or GET /auth/me 401.
 */
export async function clearClientSession(): Promise<void> {
  useAuthStore.getState().clearAuth();
  if (typeof window === 'undefined') return;
  try {
    await signOut({ redirect: false });
  } catch {
    /* ignore — cookie/session may already be gone */
  }
}
