import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type { PromoRedeemResponse } from '@/api/types/student-credits.types';

export type PromoRedeemVariables = { code: string };

function normalizeRedeem(raw: unknown): PromoRedeemResponse {
  const rec =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const unlocksPlan = rec.unlocksPlan;
  const planOk =
    unlocksPlan === 'basic' || unlocksPlan === 'pro' ? unlocksPlan : undefined;
  const granted = rec.questionCreditsGranted;
  const n =
    typeof granted === 'number' && Number.isFinite(granted) ? granted : undefined;
  return {
    ok: true,
    ...(planOk ? { unlocksPlan: planOk } : {}),
    ...(n !== undefined ? { questionCreditsGranted: n } : {}),
  };
}

export function usePromoRedeem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ code }: PromoRedeemVariables) => {
      const { data } = await apiClient.post<unknown>(API.promo.redeem, {
        code: code.trim(),
      });
      return normalizeRedeem(data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.questionCredits });
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.referral });
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.profile });
    },
  });
}
