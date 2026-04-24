'use client';

import { useState } from 'react';
import { useExamCountdown } from '@/hooks/exam-countdown/useExamCountdown';
import { useSubscriptionWithTier } from '@/hooks/subscriptions/useSubscriptionMe';
import { UpgradeModal } from '@/components/pricing/UpgradeModal';

type Props = {
  courseId?: string;
  courseName?: string;
};

export function ExamCountdownTeaser({ courseId, courseName }: Props) {
  const { tier } = useSubscriptionWithTier();
  const isPro = tier === 'pro';
  const q = useExamCountdown(courseId, Boolean(courseId && isPro));
  const [open, setOpen] = useState(false);

  if (isPro && courseId && q.data && typeof q.data === 'object') {
    const rec = q.data as Record<string, unknown>;
    const days =
      typeof rec.daysUntilExam === 'number'
        ? rec.daysUntilExam
        : typeof rec.daysRemaining === 'number'
          ? rec.daysRemaining
          : null;
    if (days != null && Number.isFinite(days)) {
      return (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
            Exam countdown{courseName ? ` · ${courseName}` : ''}
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-900 dark:text-emerald-100">
            {days} days to go
          </p>
        </div>
      );
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-full cursor-pointer rounded-xl border border-orange-200/60 bg-gradient-to-r from-orange-50 to-amber-50 p-4 text-left dark:border-orange-900/50 dark:from-orange-950/30 dark:to-amber-950/20"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span className="text-orange-600 dark:text-orange-400" aria-hidden>
                ⏰
              </span>
              <span className="text-xs font-semibold text-orange-800 dark:text-orange-200">
                Exam countdown
              </span>
              <span className="rounded bg-orange-100 px-1.5 text-[10px] font-semibold text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
                Pro
              </span>
            </div>
            <div className="select-none opacity-80">
              <p className="break-words text-sm font-bold text-slate-800 dark:text-slate-100">
                12 days until your exam
              </p>
              <p className="break-words text-xs text-slate-500">
                Focus on: Recursion, Trees, Sorting
              </p>
            </div>
          </div>
          <span className="text-2xl transition group-hover:scale-110" aria-hidden>
            🔒
          </span>
        </div>
      </button>
      <UpgradeModal isOpen={open} onClose={() => setOpen(false)} trigger="ai" />
    </>
  );
}
