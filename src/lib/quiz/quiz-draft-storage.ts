export type QuizDraftV1 = {
  mcqAnswers: Record<string, number>;
  essayDraft: Record<string, string>;
  submitted: boolean;
  /** Countdown seconds left when submit happened (for display after submit). */
  frozenTimerSec?: number | null;
  savedAt: string;
};

const STORAGE_KEY = 'edulamad.quiz.drafts.v1';

function readAll(): Record<string, QuizDraftV1> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, QuizDraftV1>)
      : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, QuizDraftV1>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota / private mode */
  }
}

export function quizDraftStorageKey(parts: {
  courseId: string;
  year: string;
  level: string;
  type: string;
  count: string | number;
  seed: string | number;
}): string {
  return [
    parts.courseId,
    parts.year,
    parts.level,
    parts.type,
    String(parts.count),
    String(parts.seed),
  ].join('|');
}

export function loadQuizDraft(sessionKey: string): QuizDraftV1 | null {
  const all = readAll();
  const d = all[sessionKey];
  if (!d || typeof d !== 'object') return null;
  return {
    mcqAnswers:
      d.mcqAnswers && typeof d.mcqAnswers === 'object' ? { ...d.mcqAnswers } : {},
    essayDraft: d.essayDraft && typeof d.essayDraft === 'object' ? { ...d.essayDraft } : {},
    submitted: d.submitted === true,
    frozenTimerSec:
      typeof d.frozenTimerSec === 'number' && Number.isFinite(d.frozenTimerSec)
        ? d.frozenTimerSec
        : null,
    savedAt: typeof d.savedAt === 'string' ? d.savedAt : new Date().toISOString(),
  };
}

export function saveQuizDraft(
  sessionKey: string,
  partial: Pick<QuizDraftV1, 'mcqAnswers' | 'essayDraft' | 'submitted'> & {
    frozenTimerSec?: number | null;
  },
): void {
  const all = readAll();
  const next: QuizDraftV1 = {
    mcqAnswers: { ...partial.mcqAnswers },
    essayDraft: { ...partial.essayDraft },
    submitted: partial.submitted,
    frozenTimerSec: partial.frozenTimerSec,
    savedAt: new Date().toISOString(),
  };
  all[sessionKey] = next;
  writeAll(all);
}
