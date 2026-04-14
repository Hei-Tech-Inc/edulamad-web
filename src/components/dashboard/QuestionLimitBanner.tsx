'use client';

import { useEffect, useState } from 'react';
import { useQuestionCredits } from '@/hooks/students/useQuestionCredits';
import { useSubscriptionWithTier } from '@/hooks/subscriptions/useSubscriptionMe';
import { FREE_LIMITS } from '@/lib/pricing';
import { isPaidTier } from '@/lib/subscription-tier';
import { UpgradeButton } from '@/components/pricing/UpgradeButton';

const STORAGE_KEY = 'edulamad.q-banner-dismissed-at';
const TWENTY_FOUR_H_MS = 24 * 60 * 60 * 1000;

export function QuestionLimitBanner() {
  const creditsQ = useQuestionCredits();
  const { tier } = useSubscriptionWithTier();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const at = Number(raw);
      if (Number.isFinite(at) && Date.now() - at < TWENTY_FOUR_H_MS) {
        setDismissed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  if (isPaidTier(tier) || dismissed) return null;
  if (!creditsQ.data) return null;

  const balance = creditsQ.data.balance;
  /** Rough gate: show when at or below one free question left (loss framing). */
  if (balance > 1) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-orange-300/50 bg-orange-500/10 p-4 sm:flex-row sm:items-start sm:justify-between dark:border-orange-800/60 dark:bg-orange-950/25">
      <div className="flex gap-3">
        <span className="text-2xl" aria-hidden>
          ⚡
        </span>
        <div>
          <p className="text-sm font-semibold text-orange-950 dark:text-orange-100">
            {balance === 0
              ? `You have used your ${FREE_LIMITS.questions} free questions`
              : `Only ${balance} free question${balance === 1 ? '' : 's'} left`}
          </p>
          <p className="mt-0.5 text-xs text-orange-900/90 dark:text-orange-200/90">
            Without Basic or Pro, you lose unlimited papers, solutions, and AI help on
            new questions.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
        <UpgradeButton trigger="question_limit" size="sm" label="Unlock unlimited questions" />
        <button
          type="button"
          onClick={dismiss}
          className="text-lg leading-none text-orange-400 hover:text-orange-600 dark:text-orange-500"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
