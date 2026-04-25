'use client';

import { useEffect, useState } from 'react';
import { requestPushPermission } from '@/lib/onesignal';

type Props = {
  enabled?: boolean;
};

export function PushPermissionPrompt({ enabled = true }: Props) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    const dismissed = window.localStorage.getItem('push.prompt.dismissed');
    if (dismissed === '1') return;
    if (Notification.permission !== 'default') return;
    const t = window.setTimeout(() => setShow(true), 3_000);
    return () => window.clearTimeout(t);
  }, [enabled]);

  if (!show) return null;

  const hide = () => {
    setShow(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('push.prompt.dismissed', '1');
    }
  };

  const handleAllow = async () => {
    setLoading(true);
    const granted = await requestPushPermission();
    setLoading(false);
    hide();
    if (granted) return;
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🔔</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">Get daily study reminders</p>
          <p className="mt-0.5 text-xs text-slate-600">We&apos;ll send you 1-2 questions a day.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => void handleAllow()}
              disabled={loading}
              className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {loading ? 'Please wait…' : 'Allow'}
            </button>
            <button
              type="button"
              onClick={hide}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
