'use client';

import { useState } from 'react';
import { getSourceTypeLabel } from '@/lib/utils/academic-year';
import { Button } from '@/components/ui/button';
import { useSubmitPracticeSolution } from '@/hooks/practice/usePracticeBank';

function badgeClass(variant: 'orange' | 'blue' | 'green' | 'purple' | 'amber' | 'default' | 'red') {
  switch (variant) {
    case 'orange':
      return 'border-brand/30 bg-brand/15 text-brand';
    case 'blue':
      return 'border-info/30 bg-info/10 text-info';
    case 'green':
      return 'border-success/30 bg-success/10 text-success';
    case 'purple':
      return 'border-purple-400/30 bg-purple-500/10 text-purple-300';
    case 'amber':
      return 'border-warning/30 bg-warning/10 text-warning';
    case 'red':
      return 'border-danger/30 bg-danger/10 text-danger';
    default:
      return 'border-white/20 bg-white/10 text-text-secondary';
  }
}

export function PracticeQuestionCard({
  question: q,
  courseId,
}: {
  question: Record<string, any>;
  courseId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [solutionText, setSolutionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [solutionError, setSolutionError] = useState('');
  const source = getSourceTypeLabel('practice_bank');
  const submitSolution = useSubmitPracticeSolution(courseId);

  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-bg-surface">
      <div
        className="cursor-pointer p-4 transition-colors hover:bg-bg-raised"
        onClick={() => setExpanded(!expanded)}
      >
        {Array.isArray(q.tags) && q.tags.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {q.tags.map((tag: any) => (
              <span
                key={String(tag._id ?? tag.id ?? tag.name)}
                className="rounded-full border border-info/20 bg-info/10 px-2 py-0.5 text-[10px] text-info"
              >
                {tag.name ?? tag}
              </span>
            ))}
            <span className={`rounded-full border px-2 py-0.5 text-[10px] ${badgeClass(source.color)}`}>
              {source.label}
            </span>
            {q.difficulty ? (
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] ${
                  q.difficulty === 'easy'
                    ? badgeClass('green')
                    : q.difficulty === 'medium'
                      ? badgeClass('amber')
                      : badgeClass('red')
                }`}
              >
                {q.difficulty}
              </span>
            ) : null}
          </div>
        ) : null}

        <p className="line-clamp-3 text-sm leading-relaxed text-text-primary">{q.questionText}</p>

        {q.type === 'mcq' && Array.isArray(q.options) && !expanded ? (
          <p className="mt-1.5 text-xs text-text-muted">{q.options.length} options - tap to see</p>
        ) : null}

        {q.sourceNote ? (
          <p className="mt-2 flex items-center gap-1 text-xs text-text-muted">
            <span>📖</span> {q.sourceNote}
          </p>
        ) : null}
      </div>

      {expanded ? (
        <div className="flex flex-col gap-3 border-t border-white/[0.06] p-4">
          {q.type === 'mcq' && Array.isArray(q.options) ? (
            <div className="flex flex-col gap-1.5">
              {q.options.map((opt: string, i: number) => (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    q.solution?.correctAnswer && opt.startsWith(`${q.solution.correctAnswer}.`)
                      ? 'border border-success/20 bg-success/10 text-success'
                      : 'bg-bg-raised text-text-secondary'
                  }`}
                >
                  {opt}
                </div>
              ))}
            </div>
          ) : null}

          {q.solution ? (
            <div className="rounded-lg bg-bg-raised p-3">
              <p className="mb-1 text-xs font-semibold text-text-secondary">Solution</p>
              {q.solution.correctAnswer ? (
                <p className="text-sm font-medium text-success">Answer: {q.solution.correctAnswer}</p>
              ) : null}
              {q.solution.explanation ? (
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  {q.solution.explanation}
                </p>
              ) : null}
            </div>
          ) : null}

          {q.relevanceNote ? (
            <p className="text-xs italic text-text-muted">Why this helps: {q.relevanceNote}</p>
          ) : null}

          {q.sourceUrl ? (
            <a
              href={q.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand underline"
            >
              View source →
            </a>
          ) : null}

          <div className="rounded-lg border border-white/[0.06] bg-bg-surface p-3">
            <p className="mb-2 text-xs font-semibold text-text-secondary">Submit solution</p>
            <div className="flex flex-col gap-2">
              {q.type === 'mcq' ? (
                <input
                  type="text"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="Correct option, e.g. A"
                  className="h-9 rounded-lg border border-white/[0.08] bg-bg-raised px-3 text-xs text-text-primary placeholder:text-text-muted focus:border-brand/50 focus:outline-none"
                />
              ) : null}
              <textarea
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
                rows={3}
                placeholder="Explain the answer or share a worked solution."
                className="w-full resize-none rounded-lg border border-white/[0.08] bg-bg-raised px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand/50 focus:outline-none"
              />
              {solutionError ? <p className="text-xs text-danger">{solutionError}</p> : null}
              <Button
                type="button"
                size="sm"
                disabled={submitSolution.isPending}
                onClick={async () => {
                  const id = String(q._id ?? q.id ?? '');
                  if (!id) {
                    setSolutionError('This question id is missing.');
                    return;
                  }
                  if (!solutionText.trim()) {
                    setSolutionError('Solution explanation is required.');
                    return;
                  }
                  setSolutionError('');
                  try {
                    await submitSolution.mutateAsync({
                      id,
                      correctAnswer: correctAnswer.trim() || undefined,
                      explanation: solutionText.trim(),
                      workedSolution: solutionText.trim(),
                    });
                    setSolutionText('');
                    setCorrectAnswer('');
                  } catch (e) {
                    setSolutionError(
                      e instanceof Error ? e.message : 'Failed to submit solution.',
                    );
                  }
                }}
              >
                {submitSolution.isPending ? 'Submitting…' : 'Submit solution'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
