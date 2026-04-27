import Link from 'next/link';
import { Clock3 } from 'lucide-react';
import { useActivityFeed } from '@/hooks/activity/useActivity';
import { formatTimeAgo } from '@/lib/utils/format';

const LABELS: Record<string, string> = {
  question_answered: 'Question answered',
  quiz_started: 'Quiz started',
  quiz_completed: 'Quiz completed',
  flashcard_reviewed: 'Flashcard reviewed',
  xp_earned: 'XP earned',
  other: 'Activity',
};

export function ActivityFeed({
  limit = 10,
  compact = false,
  showHeaderLink = true,
}: {
  limit?: number;
  compact?: boolean;
  showHeaderLink?: boolean;
}) {
  const activityQ = useActivityFeed(limit);

  if (activityQ.isLoading) {
    return (
      <div className="mt-3 space-y-2">
        {Array.from({ length: compact ? 3 : 6 }).map((_, idx) => (
          <div key={`activity-skeleton-${idx}`} className="h-12 animate-pulse rounded-lg bg-white/10" />
        ))}
      </div>
    );
  }

  if (activityQ.isError) {
    return <p className="mt-3 text-sm text-slate-400">Activity is unavailable right now.</p>;
  }

  if (!activityQ.data?.length) {
    return <p className="mt-3 text-sm text-slate-400">No activity yet. Start a quiz to begin tracking.</p>;
  }

  return (
    <div className="mt-3">
      {!compact ? (
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">Recent actions</p>
          {showHeaderLink ? (
            <Link href="/activity" className="text-xs font-semibold text-orange-300 hover:text-orange-200">
              Open full activity
            </Link>
          ) : null}
        </div>
      ) : null}
      <ul className="space-y-2">
        {activityQ.data.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-100"
          >
            <p className="break-words">{item.label}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] uppercase tracking-wide text-slate-500">
              <Clock3 className="h-3 w-3" />
              {LABELS[item.kind] ?? LABELS.other} · {formatTimeAgo(item.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
