'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSubscriptionWithTier } from '@/hooks/subscriptions/useSubscriptionMe';
import { getPlan } from '@/lib/pricing';
import { UpgradeModal } from '@/components/pricing/UpgradeModal';

export function UpgradeCard() {
  const { tier } = useSubscriptionWithTier();
  const [open, setOpen] = useState(false);
  const basic = getPlan('basic');

  if (tier !== 'free') return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg dark:from-orange-950 dark:to-slate-900">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-500/25 blur-2xl"
        aria-hidden
      />
      <div className="relative">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-orange-400">
          You are on the free plan
        </p>
        <h3 className="text-lg font-bold leading-tight">
          You are losing solutions on every question you open
        </h3>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
          {[
            'Step-by-step solutions',
            'AI explanations',
            'Flashcard decks',
            'Exam simulations',
          ].map((item) => (
            <li key={item}>🔒 {item}</li>
          ))}
        </ul>
        <div className="mt-4">
          <span className="text-2xl font-bold text-orange-400">
            {basic.displayMonthly}
          </span>
          <span className="text-slate-400 text-sm">/month</span>
          <span className="ml-2 text-xs text-slate-500 line-through">₵12</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Unlock unlimited questions — from {basic.displayMonthly}/mo
        </button>
        <p className="mt-2 text-center text-xs text-slate-500">
          Cancel any time · 3,200+ students on Basic
        </p>
        <p className="mt-2 text-center text-[11px] text-slate-500">
          Prefer semester?{' '}
          <Link href="/pricing" className="text-orange-300 hover:underline">
            See pricing
          </Link>
        </p>
      </div>
      <UpgradeModal isOpen={open} onClose={() => setOpen(false)} trigger="generic" />
    </div>
  );
}
