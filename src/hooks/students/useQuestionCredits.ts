import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type {
  QuestionCreditsDto,
  QuestionCreditLedgerEntry,
} from '@/api/types/student-credits.types';

function asLedger(v: unknown): QuestionCreditLedgerEntry[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is QuestionCreditLedgerEntry => x !== null && typeof x === 'object');
}

function normalizeCredits(raw: unknown): QuestionCreditsDto {
  const rec =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const balance =
    typeof rec.balance === 'number' && Number.isFinite(rec.balance) ? rec.balance : 0;
  const lifetimeEarned =
    typeof rec.lifetimeEarned === 'number' && Number.isFinite(rec.lifetimeEarned)
      ? rec.lifetimeEarned
      : 0;
  const lifetimeUsed =
    typeof rec.lifetimeUsed === 'number' && Number.isFinite(rec.lifetimeUsed)
      ? rec.lifetimeUsed
      : 0;
  const viewedQuestionIds = Array.isArray(rec.viewedQuestionIds)
    ? rec.viewedQuestionIds.filter((id): id is string => typeof id === 'string')
    : [];
  return {
    balance,
    lifetimeEarned,
    lifetimeUsed,
    viewedQuestionIds,
    ledger: asLedger(rec.ledger),
  };
}

export function useQuestionCredits(enabled = true) {
  return useQuery({
    queryKey: queryKeys.students.questionCredits,
    enabled,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.students.meQuestionCredits, {
        signal,
      });
      return normalizeCredits(data);
    },
    staleTime: 30_000,
  });
}
