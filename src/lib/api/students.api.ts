import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

export type ActivityKind =
  | 'question_answered'
  | 'quiz_started'
  | 'quiz_completed'
  | 'flashcard_reviewed'
  | 'xp_earned'
  | 'other';

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  label: string;
  meta?: string;
  points?: number;
  createdAt?: string;
};

export type ActivityStats = {
  todayActions: number;
  weekActions: number;
  quizzesCompleted: number;
  questionsAnswered: number;
  flashcardsReviewed: number;
  xpEarned: number;
  weeklyBuckets: Array<{ date: string; count: number }>;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function pickArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  const rec = asRecord(v);
  if (!rec) return [];
  const candidates = ['items', 'data', 'results', 'rows', 'activities'];
  for (const k of candidates) {
    const value = rec[k];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function normalizeKind(raw: unknown): ActivityKind {
  const value = typeof raw === 'string' ? raw.toLowerCase() : '';
  if (
    value === 'question_answered' ||
    value === 'quiz_started' ||
    value === 'quiz_completed' ||
    value === 'flashcard_reviewed' ||
    value === 'xp_earned'
  ) {
    return value;
  }
  return 'other';
}

function normalizeActivityItem(row: unknown): ActivityItem | null {
  const rec = asRecord(row);
  if (!rec) return null;
  const id = typeof rec.id === 'string' ? rec.id : typeof rec._id === 'string' ? rec._id : '';
  if (!id) return null;
  return {
    id,
    kind: normalizeKind(rec.kind ?? rec.type),
    label: typeof rec.label === 'string' ? rec.label : 'Activity',
    meta: typeof rec.meta === 'string' ? rec.meta : undefined,
    points: Number.isFinite(Number(rec.points)) ? Number(rec.points) : undefined,
    createdAt: typeof rec.createdAt === 'string' ? rec.createdAt : undefined,
  };
}

function defaultStats(): ActivityStats {
  return {
    todayActions: 0,
    weekActions: 0,
    quizzesCompleted: 0,
    questionsAnswered: 0,
    flashcardsReviewed: 0,
    xpEarned: 0,
    weeklyBuckets: [],
  };
}

export const studentsApi = {
  async getActivity(
    params: { limit?: number } = {},
    signal?: AbortSignal,
  ): Promise<ActivityItem[]> {
    const { data } = await apiClient.get<unknown>(API.students.meActivity, {
      signal,
      params: { limit: params.limit ?? 15 },
    });
    return pickArray(data).map(normalizeActivityItem).filter(Boolean) as ActivityItem[];
  },
  async getActivityStats(signal?: AbortSignal): Promise<ActivityStats> {
    const { data } = await apiClient.get<unknown>(API.students.meActivityStats, { signal });
    const rec = asRecord(data);
    if (!rec) return defaultStats();
    return {
      todayActions: Number(rec.todayActions ?? 0) || 0,
      weekActions: Number(rec.weekActions ?? 0) || 0,
      quizzesCompleted: Number(rec.quizzesCompleted ?? 0) || 0,
      questionsAnswered: Number(rec.questionsAnswered ?? 0) || 0,
      flashcardsReviewed: Number(rec.flashcardsReviewed ?? 0) || 0,
      xpEarned: Number(rec.xpEarned ?? 0) || 0,
      weeklyBuckets: pickArray(rec.weeklyBuckets).flatMap((row) => {
        const bucket = asRecord(row);
        if (!bucket) return [];
        const date = typeof bucket.date === 'string' ? bucket.date : '';
        if (!date) return [];
        return [{ date, count: Number(bucket.count ?? 0) || 0 }];
      }),
    };
  },
};
