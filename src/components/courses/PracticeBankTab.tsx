'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import EmptyState from '@/components/ui/EmptyState';
import { EditDrawer } from '@/components/admin/entity/EditDrawer';
import { usePracticeQuestions } from '@/hooks/practice/usePracticeBank';
import { useCourseTags } from '@/hooks/tags/useTags';
import { PracticeQuestionCard } from '@/components/courses/PracticeQuestionCard';
import { SubmitPracticeQuestionForm } from '@/components/courses/SubmitPracticeQuestionForm';

export function PracticeBankTab({ courseId }: { courseId: string }) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const { data: questions, isLoading } = usePracticeQuestions(courseId, {
    status: 'approved',
    tag: selectedTag ?? undefined,
    limit: 20,
    cursor,
  });
  const { data: tags } = useCourseTags(courseId);

  useEffect(() => {
    setCursor(undefined);
  }, [selectedTag, courseId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Practice bank</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Curated questions to help you prepare beyond past papers
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setSubmitOpen(true)}>
          + Submit question
        </Button>
      </div>

      {questions?.mocked ? (
        <Card className="border-warning/30 bg-warning/10 text-xs text-warning">
          Practice bank endpoint is unavailable in the current backend contract. This view will populate when that route is deployed.
        </Card>
      ) : null}

      {tags && tags.length > 0 ? (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedTag(null)}
            className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              !selectedTag
                ? 'border-brand/30 bg-brand/15 text-brand'
                : 'border-white/10 text-text-muted'
            }`}
            type="button"
          >
            All topics
          </button>
          {tags.map((tag: any) => (
            <button
              key={tag._id}
              onClick={() => setSelectedTag(selectedTag === tag._id ? null : tag._id)}
              className={`flex-shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedTag === tag._id
                  ? 'border-info/30 bg-info/15 text-info'
                  : 'border-white/10 text-text-muted'
              }`}
              type="button"
            >
              {tag.name}
              <span className="ml-1 opacity-60">({tag.usageCount ?? 0})</span>
            </button>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-white/10" />
          ))}
        </div>
      ) : (questions?.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="No practice questions yet"
          subtitle="Be the first to submit a useful question for this course"
          actionLabel="Submit a question"
          onAction={() => setSubmitOpen(true)}
          variant="dark"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {(questions?.data ?? []).map((q: any) => (
            <PracticeQuestionCard key={q._id ?? q.id ?? q.questionText} question={q} courseId={courseId} />
          ))}
        </div>
      )}

      {questions?.nextCursor ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setCursor(questions.nextCursor ?? undefined)}
          >
            Load more
          </Button>
        </div>
      ) : null}

      <EditDrawer
        isOpen={submitOpen}
        onClose={() => setSubmitOpen(false)}
        title="Submit practice question"
        subtitle="Curated questions earn XP when approved"
      >
        <SubmitPracticeQuestionForm
          courseId={courseId}
          onSuccess={() => setSubmitOpen(false)}
        />
      </EditDrawer>
    </div>
  );
}
