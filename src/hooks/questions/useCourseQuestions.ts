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
};

type Filters = {
  courseId: string | null;
  year: string;
  level: string;
  type: string;
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

function normalizeQuestions(raw: unknown): CourseQuestion[] {
  return pickArray(raw)
    .map((input) => {
      const rec = asRecord(input);
      if (!rec) return null;
      const id = rec.id ?? rec._id ?? rec.uuid;
      const questionText = rec.questionText ?? rec.text ?? rec.prompt;
      if (typeof id !== 'string' || typeof questionText !== 'string') return null;
      return {
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
      };
    })
    .filter((v): v is CourseQuestion => Boolean(v));
}

export function useCourseQuestions(filters: Filters) {
  const courseId = filters.courseId ?? '';
  const year = filters.year.trim();
  const level = filters.level.trim();
  const type = filters.type.trim();
  const enabled = Boolean(courseId && year && level && type);

  return useQuery({
    queryKey: queryKeys.questions.byCourse({ courseId, year, level, type }),
    enabled,
    queryFn: async ({ signal }): Promise<CourseQuestion[]> => {
      const { data } = await apiClient.get<unknown>(API.questions.byCourse(courseId), {
        params: { year, level, type },
        signal,
      });
      return normalizeQuestions(data);
    },
  });
}
