import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

export type AbandonedQuizItem = {
  id: string;
  _id: string;
  courseId: string;
  courseName: string;
  status: string;
  lastQuestion: number;
  totalQuestions: number;
  updatedAt?: string;
};

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.data)) return record.data;
  }
  return [];
}

function normalizeAbandonedQuiz(row: unknown): AbandonedQuizItem | null {
  if (!row || typeof row !== 'object') return null;
  const rec = row as Record<string, unknown>;
  const rawId =
    typeof rec.id === 'string' && rec.id ? rec.id : typeof rec._id === 'string' ? rec._id : null;
  const courseId = typeof rec.courseId === 'string' ? rec.courseId : '';
  const courseName = typeof rec.courseName === 'string' ? rec.courseName : 'Course';
  const status = typeof rec.status === 'string' ? rec.status : 'ABANDONED';
  const lastQuestion = Number(rec.lastQuestion ?? 0);
  const totalQuestions = Number(rec.totalQuestions ?? 0);
  if (!rawId || !courseId) return null;
  const updatedAt = typeof rec.updatedAt === 'string' ? rec.updatedAt : undefined;
  return {
    id: rawId,
    _id: rawId,
    courseId,
    courseName,
    status,
    lastQuestion: Number.isFinite(lastQuestion) ? lastQuestion : 0,
    totalQuestions: Number.isFinite(totalQuestions) ? totalQuestions : 0,
    updatedAt,
  };
}

export const quizApi = {
  getAbandoned: async (signal?: AbortSignal): Promise<AbandonedQuizItem[]> => {
    const { data } = await apiClient.get<unknown>(API.quiz.abandoned, { signal });
    return asArray(data).map(normalizeAbandonedQuiz).filter(Boolean) as AbandonedQuizItem[];
  },
  resume: async (id: string) => {
    const { data } = await apiClient.post(API.quiz.resume(id));
    return data;
  },
};
