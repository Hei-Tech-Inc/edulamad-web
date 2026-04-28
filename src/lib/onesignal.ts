'use client';

import { notificationsApi } from '@/lib/api/notifications.api';

async function getOneSignal() {
  const mod = await import('react-onesignal');
  return mod.default;
}

let sdkInitialized = false;
let initPromise: Promise<void> | null = null;
let pushChangeListenerAttached = false;

function isAlreadyInitializedError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /already initialized/i.test(msg);
}

/**
 * OneSignal must only be initialized once per page load. Login, AuthContext, and
 * OneSignalInit previously all called init — parallel calls raced and triggered
 * "SDK already initialized".
 */
async function ensureSdkInitialized(): Promise<void> {
  if (typeof window === 'undefined') return;
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) {
    console.warn('[OneSignal] NEXT_PUBLIC_ONESIGNAL_APP_ID not set');
    return;
  }
  if (sdkInitialized) return;

  if (!initPromise) {
    initPromise = (async () => {
      const OneSignal = await getOneSignal();
      try {
        await OneSignal.init({
          appId,
          allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
          serviceWorkerPath: 'push/OneSignalSDKWorker.js',
          serviceWorkerUpdaterPath: 'push/OneSignalSDKUpdaterWorker.js',
          serviceWorkerParam: { scope: '/push/' },
        });
      } catch (err) {
        if (!isAlreadyInitializedError(err)) throw err;
      }
      sdkInitialized = true;
    })().finally(() => {
      initPromise = null;
    });
  }

  await initPromise;
}

export async function initOneSignal(userId?: string): Promise<void> {
  await ensureSdkInitialized();

  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) return;

  const OneSignal = await getOneSignal();

  if (userId) {
    try {
      await OneSignal.login(userId);
    } catch {
      // Non-critical in browsers with blocked storage/cookies.
    }
  }

  if (!pushChangeListenerAttached) {
    pushChangeListenerAttached = true;
    OneSignal.User.PushSubscription.addEventListener('change', async (event) => {
      const id = event?.current?.id;
      if (id) {
        await registerDeviceWithBackend(id, 'web');
      }
    });
  }

  const subscriptionId = await Promise.resolve(OneSignal.User.PushSubscription.id).catch(
    () => null,
  );
  if (subscriptionId) {
    await registerDeviceWithBackend(subscriptionId, 'web');
  }
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
