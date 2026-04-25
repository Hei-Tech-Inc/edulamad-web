import { useRouter } from 'next/router';
import { useAbandonedQuizzes } from '@/hooks/quiz/useAbandonedQuizzes';

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;
  return (
    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-amber-100">
      <div className="h-full rounded-full bg-amber-500 transition-[width]" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function AbandonedQuizWidget() {
  const { data: abandoned } = useAbandonedQuizzes();
  const router = useRouter();

  if (!Array.isArray(abandoned) || abandoned.length === 0) return null;
  const quiz = abandoned[0] as Record<string, unknown>;

  const id = String(quiz._id ?? quiz.id ?? '');
  const courseName = String(quiz.courseName ?? 'Course');
  const lastQuestion = Number(quiz.lastQuestion ?? 0);
  const totalQuestions = Number(quiz.totalQuestions ?? 0);

  if (!id) return null;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-xl">⏸️</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Unfinished quiz</p>
          <p className="mt-0.5 truncate text-xs text-slate-600">
            {courseName} · Q{lastQuestion} of {totalQuestions}
          </p>
          <ProgressBar value={lastQuestion} max={totalQuestions} />
        </div>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          onClick={() => void router.push(`/quiz/${id}`)}
        >
          Resume
        </button>
      </div>
    </section>
  );
}
