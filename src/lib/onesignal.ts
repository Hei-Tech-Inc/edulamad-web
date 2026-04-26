import OneSignal from 'react-onesignal';
import { notificationsApi } from '@/lib/api/notifications.api';

let initialized = false;

export async function initOneSignal(userId?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) return;

  if (!initialized) {
    await OneSignal.init({
      appId,
      allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
      serviceWorkerPath: 'OneSignalSDKWorker.js',
      serviceWorkerUpdaterPath: 'OneSignalSDKUpdaterWorker.js',
      serviceWorkerParam: { scope: '/' },
    });
    initialized = true;
  }

  if (userId) {
    try {
      await OneSignal.login(userId);
    } catch {
      // Non-critical in browsers with blocked storage/cookies.
    }
  }

  const subscriptionId = OneSignal.User.PushSubscription.id;
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
  try {
    await OneSignal.Notifications.requestPermission();
    return Notification.permission === 'granted';
  } catch {
    return false;
  }
}
