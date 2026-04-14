'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getPlan, type BillingPeriod } from '@/lib/pricing';
import { CompactPlanCard } from '@/components/pricing/CompactPlanCard';
import { PromoCodeInput } from '@/components/pricing/PromoCodeInput';
import { useUpgrade } from '@/hooks/pricing/useUpgrade';

export type UpgradeTrigger =
  | 'question_limit'
  | 'solution'
  | 'ai'
  | 'discussion'
  | 'generic';

const TRIGGER_COPY: Record<
  UpgradeTrigger,
  { headline: string; subtext: string; highlight: string[] }
> = {
  question_limit: {
    headline: "You've opened your 3 free questions",
    subtext:
      'Without upgrading, you lose access to full papers, solutions, and AI help on new questions.',
    highlight: ['Unlimited past questions'],
  },
  solution: {
    headline: 'You are missing step-by-step solutions on this paper',
    subtext:
      'Stay on Free and you keep guessing. Basic unlocks verified solutions and AI walkthroughs.',
    highlight: ['Question solutions & answers', 'AI step-by-step explanations'],
  },
  ai: {
    headline: 'AI study tools are not on your current access',
    subtext:
      'Every day on Free is a day without tutor-style explanations and predictions.',
    highlight: [
      'Discussion with AI tutor',
      'Lecture slide summaries',
      'Question prediction',
    ],
  },
  discussion: {
    headline: 'Your AI discussion is locked',
    subtext:
      'You lose the fastest way to clear confusion on tough exam questions.',
    highlight: ['Discussion with AI tutor'],
  },
  generic: {
    headline: 'Unlock the full Edulamad experience',
    subtext:
      'On Free you cap out fast — paid plans remove the ceiling on questions and tools.',
    highlight: ['Unlimited questions', 'AI explanations', 'Flashcard decks'],
  },
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  trigger?: UpgradeTrigger;
};

export function UpgradeModal({
  isOpen,
  onClose,
  trigger = 'generic',
}: Props) {
  const copy = TRIGGER_COPY[trigger];
  const { upgrade } = useUpgrade();
  const [billing, setBilling] = useState<BillingPeriod>('semester');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            {copy.headline}
          </DialogTitle>
          <DialogDescription className="text-center">
            {copy.subtext}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-3 text-xs">
          <button
            type="button"
            className={billing === 'monthly' ? 'font-semibold' : 'text-slate-500'}
            onClick={() => setBilling('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={billing === 'semester' ? 'font-semibold' : 'text-slate-500'}
            onClick={() => setBilling('semester')}
          >
            Semester (save vs 4× monthly)
          </button>
        </div>

        <ul className="flex flex-wrap justify-center gap-2">
          {copy.highlight.map((h) => (
            <li
              key={h}
              className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-medium text-orange-900 dark:bg-orange-950/50 dark:text-orange-200"
            >
              {h}
            </li>
          ))}
        </ul>

        <div className="grid gap-3 sm:grid-cols-2">
          <CompactPlanCard
            plan={getPlan('basic')}
            billing={billing}
            onSelect={() => void upgrade('basic', billing)}
          />
          <CompactPlanCard
            plan={getPlan('pro')}
            billing={billing}
            highlighted
            onSelect={() => void upgrade('pro', billing)}
          />
        </div>

        <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className="mb-3 text-center text-xs text-slate-500">
            Or earn more free questions
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/profile/referral"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Invite a friend → +3 questions
            </Link>
            <Link
              href="/upload"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Upload a question → bonus credits
            </Link>
          </div>
        </div>

        <PromoCodeInput onSuccess={onClose} compact />
      </DialogContent>
    </Dialog>
  );
}
