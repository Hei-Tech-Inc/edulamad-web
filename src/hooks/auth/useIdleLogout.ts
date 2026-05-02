import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

/** Default idle timeout before automatic logout (ms). */
const DEFAULT_IDLE_MS = 15 * 60 * 1000;

/** Max configurable idle period (24h) to avoid accidental huge values. */
const MAX_IDLE_MS = 24 * 60 * 60 * 1000;

function throttle<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let last = 0;
  return ((...args: unknown[]) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  }) as T;
}

/**
 * Parses `NEXT_PUBLIC_IDLE_LOGOUT_MINUTES`.
 * - Unset: default 15 minutes.
 * - `0`, `false`, `off`: disabled (returns null).
 */
export function getIdleLogoutMs(): number | null {
  const raw = process.env.NEXT_PUBLIC_IDLE_LOGOUT_MINUTES;
  if (raw === undefined || raw === '') {
    return DEFAULT_IDLE_MS;
  }
  const trimmed = raw.trim().toLowerCase();
  if (trimmed === '0' || trimmed === 'false' || trimmed === 'off') {
    return null;
  }
  const minutes = Number(raw);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return null;
  }
  const ms = minutes * 60 * 1000;
  return Math.min(ms, MAX_IDLE_MS);
}

export interface UseIdleLogoutOptions {
  enabled: boolean;
  onIdle: () => void | Promise<void>;
}

/**
 * Calls `onIdle` after `idleMs` with no user activity (mouse, keyboard, touch, scroll).
 * Tab visibility does not pause the timer — background idle still counts.
 */
export function useIdleLogout({ enabled, onIdle }: UseIdleLogoutOptions): void {
  const idleMs = getIdleLogoutMs();
  const lastActivityRef = useRef(Date.now());
  const onIdleRef = useRef(onIdle);
  const firedRef = useRef(false);
  const router = useRouter();

  onIdleRef.current = onIdle;

  useEffect(() => {
    if (enabled) {
      firedRef.current = false;
      lastActivityRef.current = Date.now();
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || idleMs === null) {
      return undefined;
    }

    const bump = () => {
      lastActivityRef.current = Date.now();
    };
    const bumpThrottled = throttle(bump, 1000);

    const events: Array<keyof WindowEventMap> = [
      'mousedown',
      'mousemove',
      'keydown',
      'touchstart',
      'scroll',
      'click',
      'wheel',
    ];

    events.forEach((event) => {
      window.addEventListener(event, bumpThrottled, { passive: true });
    });

    const onRouteDone = () => {
      bump();
    };
    router.events.on('routeChangeComplete', onRouteDone);

    const intervalMs = Math.min(15_000, Math.max(5000, Math.floor(idleMs / 20)));
    const id = window.setInterval(() => {
      if (firedRef.current) return;
      if (Date.now() - lastActivityRef.current >= idleMs) {
        firedRef.current = true;
        void Promise.resolve(onIdleRef.current()).catch(() => {
          /* avoid unhandled rejection if logout fails */
        });
      }
    }, intervalMs);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, bumpThrottled);
      });
      router.events.off('routeChangeComplete', onRouteDone);
      window.clearInterval(id);
    };
  }, [enabled, idleMs, router.events]);
}
