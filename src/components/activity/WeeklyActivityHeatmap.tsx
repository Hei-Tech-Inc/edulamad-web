import { useMemo } from 'react';
import { useActivityStats } from '@/hooks/activity/useActivity';

function toneClass(count: number): string {
  if (count >= 12) return 'bg-emerald-300';
  if (count >= 8) return 'bg-emerald-400/80';
  if (count >= 4) return 'bg-emerald-500/70';
  if (count >= 1) return 'bg-emerald-700/70';
  return 'bg-white/10';
}

export function WeeklyActivityHeatmap() {
  const statsQ = useActivityStats();

  const buckets = useMemo(() => {
    return statsQ.data?.weeklyBuckets ?? [];
  }, [statsQ.data]);

  if (statsQ.isLoading) {
    return <div className="h-20 animate-pulse rounded-lg bg-white/10" />;
  }

  if (!buckets.length) {
    return <p className="text-sm text-slate-400">Weekly heatmap appears once activity data is available.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-slate-400">Last 7 days</p>
      <div className="grid grid-cols-7 gap-2">
        {buckets.slice(-7).map((bucket) => (
          <div
            key={bucket.date}
            className={`h-16 rounded-lg border border-white/10 ${toneClass(bucket.count)} flex items-end justify-center pb-1 text-[10px] font-semibold text-slate-900`}
            title={`${bucket.date}: ${bucket.count} action${bucket.count === 1 ? '' : 's'}`}
          >
            {bucket.count}
          </div>
        ))}
      </div>
    </div>
  );
}
