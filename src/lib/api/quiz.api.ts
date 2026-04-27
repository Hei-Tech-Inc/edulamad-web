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

export type QuizHistoryItem = {
  id: string;
  quizId: string;
  courseId: string;
  courseName: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  durationSeconds: number;
  startedAt?: string;
  completedAt?: string;
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

function normalizeQuizHistoryItem(row: unknown): QuizHistoryItem | null {
  if (!row || typeof row !== 'object') return null;
  const rec = row as Record<string, unknown>;
  const id = typeof rec.id === 'string' ? rec.id : typeof rec._id === 'string' ? rec._id : '';
  const quizId = typeof rec.quizId === 'string' ? rec.quizId : id;
  const courseId = typeof rec.courseId === 'string' ? rec.courseId : '';
  const courseName = typeof rec.courseName === 'string' ? rec.courseName : 'Course';
  if (!id || !courseId) return null;
  const score = Number(rec.score ?? rec.correctAnswers ?? 0);
  const totalQuestions = Number(rec.totalQuestions ?? rec.questionCount ?? 0);
  const durationSeconds = Number(rec.durationSeconds ?? rec.timeSpentSeconds ?? 0);
  const accuracySource =
    Number(rec.accuracy) ||
    (Number.isFinite(score) && Number.isFinite(totalQuestions) && totalQuestions > 0
      ? (score / totalQuestions) * 100
      : 0);
  return {
    id,
    quizId,
    courseId,
    courseName,
    score: Number.isFinite(score) ? score : 0,
    totalQuestions: Number.isFinite(totalQuestions) ? totalQuestions : 0,
    accuracy: Number.isFinite(accuracySource) ? Math.max(0, Math.round(accuracySource)) : 0,
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 0,
    startedAt: typeof rec.startedAt === 'string' ? rec.startedAt : undefined,
    completedAt: typeof rec.completedAt === 'string' ? rec.completedAt : undefined,
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
  getHistory: async (
    params: { page?: number; limit?: number },
    signal?: AbortSignal,
  ): Promise<{ items: QuizHistoryItem[]; page: number; limit: number; hasMore: boolean }> => {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const { data } = await apiClient.get<unknown>(API.quiz.history, {
      signal,
      params: { page, limit },
    });
    const items = asArray(data)
      .map(normalizeQuizHistoryItem)
      .filter(Boolean) as QuizHistoryItem[];
    const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    const hasMore = Boolean(
      record?.hasMore ??
        (typeof record?.page === 'number' && typeof record?.totalPages === 'number'
          ? record.page < record.totalPages
          : false),
    );
    return { items, page, limit, hasMore };
  },
};
