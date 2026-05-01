'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BellRing, Sparkles, X } from 'lucide-react';
import { requestPushPermission } from '@/lib/onesignal';

type Props = {
  enabled?: boolean;
};

export function PushPermissionPrompt({ enabled = true }: Props) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entered, setEntered] = useState(false);

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

  useEffect(() => {
    if (!show) return;
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, [show]);

  if (!show) return null;

  const hide = () => {
    setEntered(false);
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
    <div
      className={`fixed bottom-24 left-4 right-4 z-50 transition-all duration-300 ease-out sm:left-auto sm:w-[26rem] ${
        entered
          ? 'translate-y-0 opacity-100'
          : 'translate-y-3 opacity-0'
      }`}
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_16px_40px_rgba(2,8,23,0.16)]">
        <div className="h-1.5 w-full bg-gradient-to-r from-brand via-orange-500 to-amber-400" />
        <div className="p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <motion.span
                className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15"
                initial={false}
                animate={
                  entered
                    ? { scale: [0.92, 1.06, 1], opacity: 1 }
                    : { scale: 0.92, opacity: 0.85 }
                }
                transition={{ duration: 0.55, times: [0, 0.45, 1], ease: 'easeOut' }}
              >
                <BellRing className="h-5 w-5" aria-hidden />
              </motion.span>
              <div>
                <p className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  <Sparkles className="h-3 w-3" />
                  Smart reminders
                </p>
                <p className="mt-1.5 text-sm font-semibold text-slate-900">
                  Stay consistent with daily practice
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Get one quick reminder each day so you never miss revision streaks.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={hide}
              aria-label="Dismiss notification prompt"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleAllow()}
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-brand/35 transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Please wait…' : 'Enable notifications'}
            </button>
            <button
              type="button"
              onClick={hide}
              className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
