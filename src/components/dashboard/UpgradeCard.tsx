'use client';

import Link from 'next/link';
import { useSubscriptionWithTier } from '@/hooks/subscriptions/useSubscriptionMe';
import { LottieMotion } from '@/components/ui/LottieMotion';

export function UpgradeCard() {
  const { tier } = useSubscriptionWithTier();

  if (tier !== 'free') return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50 to-amber-50 p-5 text-slate-900 dark:border-orange-900/50 dark:from-orange-950 dark:to-slate-900 dark:text-white">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-500/20 blur-2xl"
        aria-hidden
      />
      <div className="relative">
        <LottieMotion
          src="https://assets-v2.lottiefiles.com/a/f34397be-1180-11ee-a4a0-9f01bce8ffcd/8QFWyMCWKA.lottie"
          className="pointer-events-none absolute -right-1 top-0 h-14 w-14 opacity-80"
        />
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400">
          You are on the free plan
        </p>
        <h3 className="break-words text-base font-bold leading-tight sm:text-lg">
          Unlock full study tools for serious exam prep
        </h3>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          Upgrade to access advanced quiz support, worked solutions, and premium learning flows.
        </p>
        <Link
          href="/upgrade"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Upgrade now
        </Link>
      </div>
    </div>
  );
}
