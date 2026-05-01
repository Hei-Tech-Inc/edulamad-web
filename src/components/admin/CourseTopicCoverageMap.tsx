'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { Card } from '@/components/ui/card';

export function CourseTopicCoverageMap({ courseId }: { courseId: string }) {
  const q = useQuery({
    queryKey: ['admin', 'topic-coverage', courseId],
    queryFn: async ({ signal }) => {
      const data = (await adminApi.topicCoverage(courseId, signal)) as any;
      return data;
    },
  });

  if (q.isLoading) {
    return <div className="h-48 animate-pulse rounded-lg bg-white/10" />;
  }

  if (q.isError) {
    return (
      <Card className="border-danger/30 bg-danger/10 text-xs text-danger">
        Failed to load topic coverage map.
      </Card>
    );
  }

  if (!q.data?.topics?.length) {
    return (
      <Card className="border-slate-200 bg-white text-xs text-slate-600">
        No topic coverage data for this course yet.
      </Card>
    );
  }

  const sortedTopics = [...q.data.topics].sort(
    (a: any, b: any) => Number(a.totalCount || 0) - Number(b.totalCount || 0),
  );
  const max = Math.max(...sortedTopics.map((t: any) => Number(t.totalCount || 0)));
  const emptyTopics = sortedTopics.filter((t: any) => Number(t.totalCount || 0) === 0).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Topic coverage</h3>
        <p className="text-xs text-text-muted">
          {q.data.coveredTopics} of {q.data.totalTopics} topics have questions
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {sortedTopics.map((topic: any) => (
          <div key={topic.tagId} className="flex items-center gap-3">
            <p className="w-40 flex-shrink-0 truncate text-xs text-text-primary">{topic.tagName}</p>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-raised">
              <div
                className={`h-full rounded-full transition-all ${
                  Number(topic.totalCount || 0) === 0 ? 'bg-danger/30' : 'bg-brand'
                }`}
                style={{
                  width: max > 0 ? `${(Number(topic.totalCount || 0) / max) * 100}%` : '0%',
                }}
              />
            </div>
            <p
              className={`w-8 flex-shrink-0 text-right font-mono text-xs ${
                Number(topic.totalCount || 0) === 0 ? 'text-danger' : 'text-text-muted'
              }`}
            >
              {topic.totalCount}
            </p>
          </div>
        ))}
      </div>

      {emptyTopics > 0 ? (
        <p className="flex items-center gap-1 text-xs text-danger">
          <span>⚠</span>
          {emptyTopics} topics have no questions yet
        </p>
      ) : null}
    </div>
  );
}
