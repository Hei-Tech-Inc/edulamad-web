import { apiClient } from '@/api/client';
import API from '@/api/endpoints';

export type QuestionTag = {
  _id: string;
  name: string;
  usageCount?: number;
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

function normalizeTag(row: unknown): QuestionTag | null {
  if (!row || typeof row !== 'object') return null;
  const rec = row as Record<string, unknown>;
  const id = typeof rec._id === 'string' ? rec._id : typeof rec.id === 'string' ? rec.id : null;
  const name = typeof rec.name === 'string' && rec.name.trim() ? rec.name.trim() : null;
  if (!id || !name) return null;
  const usageCount =
    rec.usageCount == null || Number.isNaN(Number(rec.usageCount))
      ? undefined
      : Number(rec.usageCount);
  return { _id: id, name, usageCount };
}

export const tagsApi = {
  getForQuestion: async (questionId: string, signal?: AbortSignal): Promise<QuestionTag[]> => {
    const { data } = await apiClient.get<unknown>(API.tags.byQuestion(questionId), { signal });
    return asArray(data).map(normalizeTag).filter(Boolean) as QuestionTag[];
  },
  addToQuestion: async (questionId: string, dto: { tagName: string }) => {
    const { data } = await apiClient.post(API.tags.byQuestion(questionId), dto);
    return data;
  },
  removeFromQuestion: async (questionId: string, tagId: string) => {
    const { data } = await apiClient.delete(API.tags.questionTag(questionId, tagId));
    return data;
  },
  getByCourse: async (courseId: string, signal?: AbortSignal): Promise<QuestionTag[]> => {
    const { data } = await apiClient.get<unknown>(API.tags.byCourse(courseId), { signal });
    return asArray(data).map(normalizeTag).filter(Boolean) as QuestionTag[];
  },
  search: async (q: string, courseId?: string, signal?: AbortSignal): Promise<QuestionTag[]> => {
    const { data } = await apiClient.get<unknown>(API.tags.search, {
      params: { q, courseId },
      signal,
    });
    return asArray(data).map(normalizeTag).filter(Boolean) as QuestionTag[];
  },
};
