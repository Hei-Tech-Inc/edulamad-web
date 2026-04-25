import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';

export type CourseQuestion = {
  id: string;
  questionText: string;
  year?: number | string;
  type?: string;
  level?: number | string;
  /** Multiple-choice lines when the API provides them (for quiz-style UI). */
  options?: string[];
  /** Short hint from the API when present (shown before fetching solutions). */
  hint?: string;
  /** R2 / storage key for linked source PDF (bundle uploads). */
  attachmentKey?: string;
};

type Filters = {
  courseId: string | null;
  year: string;
  level: string;
  /** Omit from API request when empty or `all` — list full course set (matches imports with mixed types). */
  type: string;
  tagId?: string | null;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function pickArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  const rec = asRecord(v);
  if (!rec) return [];
  const candidates = ['items', 'data', 'results', 'rows', 'questions'];
  for (const key of candidates) {
    const next = rec[key];
    if (Array.isArray(next)) return next;
  }
  return [];
}

function normalizeOptions(rec: Record<string, unknown>): string[] | undefined {
  const raw =
    rec.options ??
    rec.choices ??
    rec.answerOptions ??
    rec.mcqOptions ??
    rec.alternatives;
  if (!Array.isArray(raw)) return undefined;
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item === 'string') {
      const s = item.trim();
      if (s) out.push(s);
      continue;
    }
    const o = asRecord(item);
    if (!o) continue;
    const text =
      typeof o.text === 'string'
        ? o.text
        : typeof o.label === 'string'
          ? o.label
          : typeof o.option === 'string'
            ? o.option
            : undefined;
    if (text?.trim()) out.push(text.trim());
  }
  return out.length ? out : undefined;
}

function normalizeQuestions(raw: unknown): CourseQuestion[] {
  return pickArray(raw).flatMap((input): CourseQuestion[] => {
    const rec = asRecord(input);
    if (!rec) return [];
    const id = rec.id ?? rec._id ?? rec.uuid;
    const questionText = rec.questionText ?? rec.text ?? rec.prompt;
    if (typeof id !== 'string' || typeof questionText !== 'string') return [];
    const attachmentRaw = rec.attachmentKey ?? rec.pdfKey ?? rec.sourcePdfKey ?? rec.bundlePdfKey;
    const attachmentKey =
      typeof attachmentRaw === 'string' && attachmentRaw.trim() !== ''
        ? attachmentRaw.trim()
        : undefined;
    const options = normalizeOptions(rec);
    const hintRaw = rec.hint ?? rec.studyHint ?? rec.clue ?? rec.tip;
    const hint =
      typeof hintRaw === 'string' && hintRaw.trim() !== '' ? hintRaw.trim() : undefined;
    return [
      {
        id,
        questionText,
        year: typeof rec.year === 'number' || typeof rec.year === 'string' ? rec.year : undefined,
        level:
          typeof rec.level === 'number' || typeof rec.level === 'string'
            ? rec.level
            : typeof rec.levelData === 'number' || typeof rec.levelData === 'string'
              ? rec.levelData
              : undefined,
        type: typeof rec.type === 'string' ? rec.type : undefined,
        options,
        hint,
        attachmentKey,
      },
    ];
  });
}

function shouldSendTypeParam(typeRaw: string): boolean {
  const t = typeRaw.trim().toLowerCase();
  return t !== '' && t !== 'all' && t !== 'any';
}

export function useCourseQuestions(filters: Filters) {
  const courseId = filters.courseId ?? '';
  const year = filters.year.trim();
  const level = filters.level.trim();
  const type = filters.type.trim();
  const tagId = (filters.tagId ?? '').trim();
  const enabled = Boolean(courseId && year && level);
  const typeKey = type || 'all';

  return useQuery({
    queryKey: queryKeys.questions.byCourse({ courseId, year, level, type: typeKey, tagId }),
    enabled,
    queryFn: async ({ signal }): Promise<CourseQuestion[]> => {
      const params: Record<string, string> = { year, level };
      if (shouldSendTypeParam(type)) {
        params.type = type.trim();
      }
      if (tagId) params.tagId = tagId;
      const { data } = await apiClient.get<unknown>(API.questions.byCourse(courseId), {
        params,
        signal,
      });
      return normalizeQuestions(data);
    },
  });
}
