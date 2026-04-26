'use client';

import { notificationsApi } from '@/lib/api/notifications.api';

let initialized = false;

async function getOneSignal() {
  const mod = await import('react-onesignal');
  return mod.default;
}

export async function initOneSignal(userId?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) {
    console.warn('[OneSignal] NEXT_PUBLIC_ONESIGNAL_APP_ID not set');
    return;
  }

  if (!initialized) {
    try {
      const OneSignal = await getOneSignal();
      await OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
        serviceWorkerPath: 'push/OneSignalSDKWorker.js',
        serviceWorkerUpdaterPath: 'push/OneSignalSDKUpdaterWorker.js',
        serviceWorkerParam: { scope: '/push/' },
      });
      initialized = true;
    } catch (err) {
      console.warn('[OneSignal] init failed', err);
      return;
    }
  }

  if (userId) {
    try {
      const OneSignal = await getOneSignal();
      await OneSignal.login(userId);
    } catch {
      // Non-critical in browsers with blocked storage/cookies.
    }
  }

  const OneSignal = await getOneSignal();
  const subscriptionId = await Promise.resolve(OneSignal.User.PushSubscription.id).catch(
    () => null,
  );
  if (subscriptionId) {
    await registerDeviceWithBackend(subscriptionId, 'web');
  }

  OneSignal.User.PushSubscription.addEventListener('change', async (event) => {
    const id = event?.current?.id;
    if (id) {
      await registerDeviceWithBackend(id, 'web');
    }
  });
}

async function registerDeviceWithBackend(
  oneSignalId: string,
  deviceType: 'web' | 'ios' | 'android',
): Promise<void> {
  try {
    await notificationsApi.registerDevice({ oneSignalId, deviceType });
  } catch {
    // Non-critical: auth/session may still be loading.
  }
}

export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const OneSignal = await getOneSignal();
    await OneSignal.Notifications.requestPermission();
    return Notification.permission === 'granted';
  } catch {
    return false;
  }
}

export async function isPushEnabled(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return Notification.permission === 'granted';
}

export async function logoutOneSignal(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const OneSignal = await getOneSignal();
    await OneSignal.logout();
  } catch {
    // ignore
  }
}
