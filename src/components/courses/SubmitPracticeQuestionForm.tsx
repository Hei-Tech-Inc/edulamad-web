'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSubmitPracticeQuestion } from '@/hooks/practice/usePracticeBank';

export function SubmitPracticeQuestionForm({
  courseId,
  onSuccess,
}: {
  courseId: string;
  onSuccess: () => void;
}) {
  const submitM = useSubmitPracticeQuestion(courseId);
  const [form, setForm] = useState({
    questionText: '',
    type: 'mcq',
    options: ['A. ', 'B. ', 'C. ', 'D. '],
    difficulty: 'medium',
    sourceNote: '',
    sourceUrl: '',
    relevanceNote: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.questionText.trim()) {
      setError('Question text is required');
      return;
    }
    setError('');
    try {
      await submitM.mutateAsync({
        questionText: form.questionText.trim(),
        type: form.type as 'mcq' | 'essay' | 'short_answer',
        options: form.type === 'mcq' ? form.options : undefined,
        difficulty: form.difficulty as 'easy' | 'medium' | 'hard',
        sourceNote: form.sourceNote || undefined,
        sourceUrl: form.sourceUrl || undefined,
        relevanceNote: form.relevanceNote || undefined,
        tags: form.tags,
      });
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit practice question.');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-xs text-text-muted">Question type *</label>
        <div className="grid grid-cols-3 gap-2">
          {['mcq', 'essay', 'short_answer'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: t }))}
              className={`rounded-lg border py-2 text-xs font-medium capitalize transition-all ${
                form.type === t
                  ? 'border-brand/40 bg-brand/15 text-brand'
                  : 'border-white/[0.08] bg-bg-surface text-text-muted'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-text-muted">Question *</label>
        <textarea
          value={form.questionText}
          onChange={(e) => setForm((f) => ({ ...f, questionText: e.target.value }))}
          placeholder="Type the full question here..."
          rows={4}
          className="w-full resize-none rounded-lg border border-white/[0.08] bg-bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand/50 focus:outline-none"
        />
      </div>

      {form.type === 'mcq' ? (
        <div>
          <label className="mb-1.5 block text-xs text-text-muted">Options *</label>
          <div className="flex flex-col gap-1.5">
            {form.options.map((opt, i) => (
              <input
                key={i}
                type="text"
                value={opt}
                onChange={(e) => {
                  const newOpts = [...form.options];
                  newOpts[i] = e.target.value;
                  setForm((f) => ({ ...f, options: newOpts }));
                }}
                className="h-10 w-full rounded-lg border border-white/[0.08] bg-bg-surface px-3 text-sm text-text-primary focus:border-brand/50 focus:outline-none"
              />
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <label className="mb-1.5 block text-xs text-text-muted">Difficulty</label>
        <div className="grid grid-cols-3 gap-2">
          {['easy', 'medium', 'hard'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setForm((f) => ({ ...f, difficulty: d }))}
              className={`rounded-lg border py-2 text-xs font-medium capitalize transition-all ${
                form.difficulty === d
                  ? d === 'easy'
                    ? 'border-success/40 bg-success/15 text-success'
                    : d === 'medium'
                      ? 'border-warning/40 bg-warning/15 text-warning'
                      : 'border-danger/40 bg-danger/15 text-danger'
                  : 'border-white/[0.08] bg-bg-surface text-text-muted'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-text-muted">Topics / tags</label>
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full border border-info/20 bg-info/10 px-2 py-0.5 text-xs text-info"
            >
              {tag}
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
                }
                className="ml-0.5 text-info/60 hover:text-info"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add a topic tag, press Enter"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && tagInput.trim()) {
              e.preventDefault();
              if (!form.tags.includes(tagInput.trim())) {
                setForm((f) => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
              }
              setTagInput('');
            }
          }}
          className="h-9 w-full rounded-lg border border-white/[0.08] bg-bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand/50 focus:outline-none"
        />
      </div>

      {[
        ['sourceNote', 'Source (where did you find this?)', 'e.g. textbook chapter 5'],
        ['sourceUrl', 'Source URL', 'https://...'],
        ['relevanceNote', 'Why is this useful for this course?', 'Why it helps for exams'],
      ].map(([key, label, placeholder]) => (
        <div key={key}>
          <label className="mb-1.5 block text-xs text-text-muted">{label}</label>
          <input
            type="text"
            placeholder={placeholder}
            value={(form as any)[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand/50 focus:outline-none"
          />
        </div>
      ))}

      {error ? <p className="text-sm text-danger">⚠ {error}</p> : null}

      <Button
        variant="default"
        type="button"
        disabled={submitM.isPending}
        onClick={() => void handleSubmit()}
      >
        {submitM.isPending ? 'Submitting…' : 'Submit question →'}
      </Button>

      <p className="text-center text-xs text-text-muted">
        Admin will review your submission. You earn XP when it is approved.
      </p>
    </div>
  );
}
