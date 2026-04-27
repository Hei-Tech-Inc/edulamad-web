'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { AppApiError } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth.store';

function firstQueryString(
  v: string | string[] | undefined,
): string | undefined {
  if (typeof v === 'string' && v) return v;
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
  return undefined;
}

/**
 * After Paystack redirects back with `reference` (and optionally `trxref`),
 * confirms payment with `GET /payments/verify/:reference` using the session JWT.
 */
export function SubscriptionPaystackReturn() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const reference = firstQueryString(router.query.reference);
  const [banner, setBanner] = useState<{
    kind: 'verifying' | 'ok' | 'err';
    text: string;
  } | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (!reference || !accessToken) return;
    if (ran.current) return;
    ran.current = true;
    setBanner({ kind: 'verifying', text: 'Confirming payment…' });

    void (async () => {
      try {
        await apiClient.get(API.payments.verify(reference));
        await queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        setBanner({
          kind: 'ok',
          text: 'Payment confirmed. Your subscription will update in a moment.',
        });
        const q = { ...router.query } as Record<string, string | string[]>;
        delete q.reference;
        delete q.trxref;
        void router.replace({ pathname: router.pathname, query: q }, undefined, {
          shallow: true,
        });
      } catch (e) {
        ran.current = false;
        const msg =
          e instanceof AppApiError
            ? e.message
            : 'Payment could not be confirmed.';
        setBanner({ kind: 'err', text: msg });
      }
    })();
  }, [reference, accessToken, router, queryClient]);

  if (!reference && !banner) return null;

  if (reference && !accessToken) {
    return (
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        Sign in to finish confirming your payment (reference in URL).
      </div>
    );
  }

  if (!banner) return null;

  const styles =
    banner.kind === 'ok'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100'
      : banner.kind === 'err'
        ? 'border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100'
        : 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200';

  return (
    <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${styles}`}>
      {banner.text}
    </div>
  );
}
