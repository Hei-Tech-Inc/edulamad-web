'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UpgradeModal } from '@/components/pricing/UpgradeModal';
import { getPlan } from '@/lib/pricing';

export function SolutionGate() {
  const [open, setOpen] = useState(false);
  const basic = getPlan('basic');

  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-5 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-xl dark:bg-orange-950/50">
        🔒
      </div>
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
        Solution locked
      </h4>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        On Free you lose model answers and AI walkthroughs — upgrade to stop guessing.
      </p>
      <div className="relative mb-4 mt-4 text-left">
        <p className="select-none text-sm text-slate-700 blur-sm dark:text-slate-200">
          The correct approach starts by identifying the key constraint in the question…
        </p>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-slate-950" />
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        Unlock solutions — from {basic.displayMonthly}/month
      </button>
      <p className="mt-2 text-xs text-slate-500">Cancel any time</p>
      <p className="mt-2 text-xs text-orange-700 dark:text-orange-300">
        <Link href="/pricing" className="font-medium hover:underline">
          Compare plans
        </Link>
      </p>
      <UpgradeModal
        isOpen={open}
        onClose={() => setOpen(false)}
        trigger="solution"
      />
    </div>
  );
}
