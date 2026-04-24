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
    <div className="relative overflow-hidden rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50 to-amber-50 p-5 text-slate-900 dark:border-orange-900/50 dark:from-orange-950 dark:to-slate-900 dark:text-white">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-500/20 blur-2xl"
        aria-hidden
      />
      <div className="relative">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400">
          You are on the free plan
        </p>
        <h3 className="break-words text-base font-bold leading-tight sm:text-lg">
          Unlock worked solutions, AI help, and exam-ready practice
        </h3>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
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
          <span className="text-sm text-slate-600 dark:text-slate-400">/month</span>
          <span className="ml-2 text-xs text-slate-500 line-through dark:text-slate-500">₵12</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 w-full break-words rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Unlock unlimited questions — from {basic.displayMonthly}/mo
        </button>
        <p className="mt-2 text-center text-xs text-slate-600 dark:text-slate-500">
          Cancel any time · 3,200+ students on Basic
        </p>
        <p className="mt-2 text-center text-[11px] text-slate-600 dark:text-slate-500">
          Prefer semester?{' '}
          <Link href="/pricing" className="text-orange-700 hover:underline dark:text-orange-300">
            See pricing
          </Link>
        </p>
      </div>
      <UpgradeModal isOpen={open} onClose={() => setOpen(false)} trigger="generic" />
    </div>
  );
}
