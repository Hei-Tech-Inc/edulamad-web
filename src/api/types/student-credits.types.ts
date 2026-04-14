/** GET /students/me/referral */
export interface StudentReferralDto {
  referralCode: string | null;
  totalReferrals: number;
  creditsEarnedFromReferrals: number;
  /** Absolute URL when the API can build it from FRONTEND_URL / auth.frontendUrl; else null. */
  referralLink: string | null;
}

/** GET /students/me/question-credits — ledger entries are backend-defined. */
export type QuestionCreditLedgerEntry = Record<string, unknown>;

export interface QuestionCreditsDto {
  balance: number;
  lifetimeEarned: number;
  lifetimeUsed: number;
  viewedQuestionIds: string[];
  ledger: QuestionCreditLedgerEntry[];
}

/** POST /promo/redeem success body */
export type PromoRedeemResponse =
  | {
      ok: true;
      unlocksPlan?: 'basic' | 'pro';
      questionCreditsGranted?: number;
    }
  | {
      ok: false;
      message: string;
      code?: string;
    };
