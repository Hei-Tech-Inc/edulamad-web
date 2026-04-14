/**
 * Single source of truth for marketing pricing UI.
 * Display strings use charm pricing; amounts in pesewas for calculations.
 */

export interface PlanFeature {
  label: string;
  included: boolean;
  highlight?: boolean;
  tooltip?: string;
  limit?: string;
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  /** Amounts in pesewas (1 GHS = 100 pesewas) */
  monthlyPrice: number;
  semesterPrice: number;
  displayMonthly: string;
  displaySemester: string;
  /** Crossed-out anchor for semester (e.g. 4× monthly) */
  originalSemester?: string;
  originalSemesterPesewas?: number;
  badge?: string;
  badgeColor?: string;
  highlight: boolean;
  ctaLabel: string;
  ctaSubtext?: string;
  features: PlanFeature[];
  studentCount?: string;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Try before you commit',
    monthlyPrice: 0,
    semesterPrice: 0,
    displayMonthly: '₵0',
    displaySemester: '₵0',
    highlight: false,
    ctaLabel: 'Start studying for free',
    studentCount: '8,000+ students',
    features: [
      { label: '3 past questions total', included: true, limit: '3 only' },
      { label: 'Browse course catalogue', included: true },
      { label: 'View question list', included: true },
      { label: 'Unlimited questions', included: false },
      { label: 'Question solutions & answers', included: false },
      { label: 'AI step-by-step explanations', included: false },
      { label: 'Exam simulation mode', included: false },
      { label: 'Flashcard decks', included: false },
      { label: 'Discussion with AI tutor', included: false },
      { label: 'Lecture slide summaries', included: false },
      { label: 'Exam countdown & topic priority', included: false },
      { label: 'Concept maps', included: false },
      { label: 'Mnemonics library', included: false },
      { label: 'Performance analytics', included: false },
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'All the past papers you need',
    monthlyPrice: 900,
    semesterPrice: 2900,
    displayMonthly: '₵9',
    displaySemester: '₵29',
    originalSemester: '₵36',
    originalSemesterPesewas: 3600,
    highlight: false,
    ctaLabel: 'Get Basic',
    ctaSubtext: 'Cancel any time',
    studentCount: '3,200+ students',
    features: [
      { label: 'Unlimited past questions', included: true, highlight: true },
      { label: 'Question solutions & answers', included: true, highlight: true },
      { label: 'AI step-by-step explanations', included: true },
      { label: 'Exam simulation mode', included: true },
      { label: 'Flashcard decks', included: true },
      { label: 'Performance analytics', included: true },
      { label: 'Mnemonics library', included: true },
      {
        label: 'Discussion with AI tutor',
        included: false,
        tooltip: 'Available on Pro plan',
      },
      {
        label: 'Lecture slide summaries',
        included: false,
        tooltip: 'Available on Pro plan',
      },
      {
        label: 'Exam countdown & topic priority',
        included: false,
        tooltip: 'Available on Pro plan',
      },
      {
        label: 'Concept maps',
        included: false,
        tooltip: 'Available on Pro plan',
      },
      { label: '20 AI requests per day', included: true, limit: '20/day' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Your complete exam preparation system',
    monthlyPrice: 1900,
    semesterPrice: 4900,
    displayMonthly: '₵19',
    displaySemester: '₵49',
    originalSemester: '₵76',
    originalSemesterPesewas: 7600,
    badge: 'Most Popular',
    badgeColor: 'bg-orange-500',
    highlight: true,
    ctaLabel: 'Unlock Pro — Start today',
    ctaSubtext: 'Cancel any time · Used by top students',
    studentCount: '1,800+ students',
    features: [
      { label: 'Everything in Basic', included: true, highlight: true },
      { label: 'Unlimited AI requests', included: true, highlight: true },
      { label: 'Discussion with AI tutor', included: true, highlight: true },
      {
        label: 'Lecture slide summaries & questions',
        included: true,
        highlight: true,
      },
      { label: 'Exam countdown & topic priority', included: true, highlight: true },
      { label: 'Concept maps', included: true },
      { label: 'AI question prediction', included: true },
      { label: 'Priority content access', included: true },
      { label: 'Download questions as PDF', included: true },
      { label: 'Early access to new features', included: true },
    ],
  },
];

export const FREE_LIMITS = {
  questions: 3,
  solutions: false,
  ai: false,
  flashcards: false,
  discussion: false,
} as const;

export function getPlan(id: string): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

/** Semester vs paying four separate months at list monthly price */
export function semesterSavingLabel(plan: Plan): string | null {
  if (
    plan.semesterPrice <= 0 ||
    plan.originalSemesterPesewas == null ||
    plan.originalSemesterPesewas <= plan.semesterPrice
  ) {
    return null;
  }
  const save = plan.originalSemesterPesewas - plan.semesterPrice;
  const cedis = save / 100;
  const rounded = Number.isInteger(cedis) ? cedis : Math.round(cedis * 10) / 10;
  return `Save ₵${rounded}`;
}

/** Approx. percent off vs 4× monthly anchor */
export function semesterSavingPercent(plan: Plan): number | null {
  if (!plan.originalSemesterPesewas || plan.semesterPrice <= 0) return null;
  return Math.round(
    (1 - plan.semesterPrice / plan.originalSemesterPesewas) * 100,
  );
}

export type BillingPeriod = 'monthly' | 'semester';
