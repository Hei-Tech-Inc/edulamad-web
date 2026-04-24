'use client';

import { useState } from 'react';
import { usePromoRedeem } from '@/hooks/promo/usePromoRedeem';
import { AppApiError } from '@/lib/api-error';

function errMsg(err: unknown, fallback: string) {
  if (err instanceof AppApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

type Props = {
  onSuccess?: () => void;
  compact?: boolean;
};

export function PromoCodeInput({ onSuccess, compact = false }: Props) {
  const redeemM = usePromoRedeem();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <p className="break-words text-center text-xs text-slate-700 dark:text-slate-300">Have a promo code?</p>
      <div
        className={`flex flex-col gap-2 ${compact ? '' : 'sm:flex-row sm:items-center'}`}
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          autoComplete="off"
          className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400"
        />
        <button
          type="button"
          disabled={redeemM.isPending}
          onClick={async () => {
            const trimmed = code.trim();
            if (!trimmed) return;
            setMsg('');
            try {
              const res = await redeemM.mutateAsync({ code: trimmed });
              if (!res.ok) {
                setOk(false);
                setMsg(res.message);
                return;
              }
              setOk(true);
              setMsg('Code applied.');
              setCode('');
              onSuccess?.();
            } catch (e) {
              setOk(false);
              setMsg(errMsg(e, 'Could not redeem code.'));
            }
          }}
          className="h-10 shrink-0 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {redeemM.isPending ? 'Applying…' : 'Apply'}
        </button>
      </div>
      {msg ? (
        <p
          className={`break-words text-center text-xs ${ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
        >
          {msg}
        </p>
      ) : null}
    </div>
  );
}
