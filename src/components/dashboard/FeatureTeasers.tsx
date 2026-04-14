'use client';

import { useState } from 'react';
import { useSubscriptionWithTier } from '@/hooks/subscriptions/useSubscriptionMe';
import type { SubscriptionTier } from '@/lib/subscription-tier';
import { UpgradeModal, type UpgradeTrigger } from '@/components/pricing/UpgradeModal';

const TEASERS: Array<{
  id: string;
  icon: string;
  title: string;
  desc: string;
  trigger: UpgradeTrigger;
  minTier: SubscriptionTier;
}> = [
  {
    id: 'solutions',
    icon: '✅',
    title: 'Solutions & answers',
    desc: 'Verified solutions when you need them',
    trigger: 'solution',
    minTier: 'basic',
  },
  {
    id: 'flashcards',
    icon: '🃏',
    title: 'Flashcard decks',
    desc: 'Spaced repetition for key concepts',
    trigger: 'generic',
    minTier: 'basic',
  },
  {
    id: 'ai-tutor',
    icon: '🤖',
    title: 'AI tutor discussion',
    desc: 'Ask anything about exam questions',
    trigger: 'ai',
    minTier: 'pro',
  },
  {
    id: 'countdown',
    icon: '⏰',
    title: 'Exam countdown',
    desc: 'Priority topics before exams',
    trigger: 'ai',
    minTier: 'pro',
  },
];

function tierRank(t: SubscriptionTier): number {
  if (t === 'free') return 0;
  if (t === 'basic') return 1;
  return 2;
}

export function FeatureTeasers() {
  const { tier } = useSubscriptionWithTier();
  const [trigger, setTrigger] = useState<UpgradeTrigger | null>(null);

  const locked = TEASERS.filter((t) => tierRank(tier) < tierRank(t.minTier));
  if (locked.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Unlock more tools
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {locked.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setTrigger(f.trigger)}
            className="group rounded-xl border border-dashed border-slate-600/60 bg-white/[0.03] p-3 text-left transition hover:border-orange-400/50 hover:bg-orange-500/10"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-lg" aria-hidden>
                {f.icon}
              </span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 transition group-hover:bg-orange-500/20 group-hover:text-orange-200">
                🔒 Upgrade
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-100">{f.title}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">{f.desc}</p>
          </button>
        ))}
      </div>
      {trigger ? (
        <UpgradeModal
          isOpen
          onClose={() => setTrigger(null)}
          trigger={trigger}
        />
      ) : null}
    </div>
  );
}
