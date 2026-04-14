import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type { PromoRedeemResponse } from '@/api/types/student-credits.types';
import { AppApiError } from '@/lib/api-error';

export type PromoRedeemVariables = { code: string };

function userMessageForPromoError(error: AppApiError): string {
  const rawMessage = (error.message || '').toLowerCase();
  const rawCode = (error.code || '').toLowerCase();
  const signal = `${rawCode} ${rawMessage}`;

  if (signal.includes('expired')) {
    return 'This promo code has expired.';
  }
  if (
    signal.includes('already') &&
    (signal.includes('redeem') || signal.includes('used'))
  ) {
    return 'This promo code has already been used.';
  }
  if (signal.includes('misconfig') || signal.includes('misconfigured')) {
    return 'This promo code is not active yet. Please contact support.';
  }
  if (
    signal.includes('not found') ||
    signal.includes('invalid') ||
    signal.includes('promo')
  ) {
    return 'Invalid promo code. Please check and try again.';
  }
  return 'Could not redeem this promo code right now. Please try again.';
}

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
      try {
        const { data } = await apiClient.post<unknown>(API.promo.redeem, {
          code: code.trim(),
        });
        return normalizeRedeem(data);
      } catch (error) {
        if (error instanceof AppApiError) {
          const lowerMsg = (error.message || '').toLowerCase();
          const lowerCode = (error.code || '').toLowerCase();
          const isInvalidCode =
            error.status === 400 ||
            error.status === 404 ||
            error.status === 422 ||
            lowerMsg.includes('invalid code') ||
            lowerMsg.includes('already redeemed') ||
            lowerMsg.includes('already used') ||
            lowerMsg.includes('expired') ||
            lowerMsg.includes('misconfigured') ||
            lowerMsg.includes('promo') ||
            lowerCode.includes('invalid') ||
            lowerCode.includes('promo');
          if (isInvalidCode) {
            return {
              ok: false,
              message: userMessageForPromoError(error),
              ...(error.code ? { code: error.code } : {}),
            } satisfies PromoRedeemResponse;
          }
        }
        throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.questionCredits });
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.referral });
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.profile });
    },
  });
}
