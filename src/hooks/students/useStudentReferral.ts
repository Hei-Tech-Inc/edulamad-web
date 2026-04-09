import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type { StudentReferralDto } from '@/api/types/student-credits.types';

function normalizeReferral(raw: unknown): StudentReferralDto {
  const rec =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    referralCode:
      typeof rec.referralCode === 'string' && rec.referralCode.trim()
        ? rec.referralCode.trim()
        : null,
    totalReferrals:
      typeof rec.totalReferrals === 'number' && Number.isFinite(rec.totalReferrals)
        ? rec.totalReferrals
        : 0,
    creditsEarnedFromReferrals:
      typeof rec.creditsEarnedFromReferrals === 'number' &&
      Number.isFinite(rec.creditsEarnedFromReferrals)
        ? rec.creditsEarnedFromReferrals
        : 0,
    referralLink:
      typeof rec.referralLink === 'string' && rec.referralLink.trim()
        ? rec.referralLink.trim()
        : null,
  };
}

export function useStudentReferral(enabled = true) {
  return useQuery({
    queryKey: queryKeys.students.referral,
    enabled,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.students.meReferral, {
        signal,
      });
      return normalizeReferral(data);
    },
    staleTime: 60_000,
  });
}
