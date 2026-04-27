import { useActivityStats } from '@/hooks/activity/useActivity';

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-100">{value}</p>
    </div>
  );
}

export function ActivityStats() {
  const statsQ = useActivityStats();

  if (statsQ.isLoading) {
    return (
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={`activity-stats-skeleton-${idx}`} className="h-20 animate-pulse rounded-lg bg-white/10" />
        ))}
      </div>
    );
  }

  if (statsQ.isError || !statsQ.data) {
    return <p className="text-sm text-slate-400">Activity stats are unavailable at the moment.</p>;
  }

  const s = statsQ.data;
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      <StatTile label="Actions today" value={s.todayActions} />
      <StatTile label="Actions this week" value={s.weekActions} />
      <StatTile label="Quizzes completed" value={s.quizzesCompleted} />
      <StatTile label="Questions answered" value={s.questionsAnswered} />
      <StatTile label="Flashcards reviewed" value={s.flashcardsReviewed} />
      <StatTile label="XP earned this week" value={s.xpEarned} />
    </div>
  );
}
