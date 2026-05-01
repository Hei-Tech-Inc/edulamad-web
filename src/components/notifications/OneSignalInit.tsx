'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { initOneSignal } from '@/lib/onesignal';

export function OneSignalInit() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    void initOneSignal(user.id).catch(() => {
      // OneSignal is optional; do not crash UI on SDK load failures.
    });
  }, [isAuthenticated, user?.id]);

  return null;
}
