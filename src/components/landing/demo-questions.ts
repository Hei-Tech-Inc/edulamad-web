export type OptionKey = 'A' | 'B' | 'C' | 'D';

export type LandingDemoAiExplanation = {
  title: string;
  bullets: readonly string[];
  shortcut: string;
};

export type LandingDemoQuestion = {
  id: string;
  /** One line shown on the green “Nice!” card after a correct pick (landing demo only). */
  correctCelebration?: string;
  /** Short label for floating chips (e.g. “Economics”) */
  field: string;
  meta: string;
  stem: string;
  options: readonly [
    { key: 'A'; text: string },
    { key: 'B'; text: string },
    { key: 'C'; text: string },
    { key: 'D'; text: string },
  ];
  correctKey: OptionKey;
  markingNote: string;
  aiExplanation: LandingDemoAiExplanation;
};

export const LANDING_DEMO_QUESTIONS: readonly LandingDemoQuestion[] = [
  {
    id: 'fin-elastic',
    correctCelebration:
      'You locked in elastic demand — price cuts can lift revenue here.',
    field: 'Economics',
    meta: 'FIN 201 · Microeconomics · elastic demand',
    stem: 'When the price elasticity of demand is greater than 1 (elastic demand), a decrease in price will most likely:',
    options: [
      { key: 'A', text: 'Reduce total revenue for the seller.' },
      { key: 'B', text: 'Increase total revenue for the seller.' },
      { key: 'C', text: 'Leave total revenue unchanged.' },
      { key: 'D', text: 'Tell you nothing about total revenue without supply data.' },
    ],
    correctKey: 'B',
    markingNote:
      'Elastic demand means quantity responds more than proportionally to price. Cutting price raises quantity sold enough that total revenue (price × quantity) goes up.',
    aiExplanation: {
      title: 'Exam-ready reasoning',
      bullets: [
        'Elastic (>1): %ΔQd > %ΔP when price moves — revenue moves with quantity on this side of the curve.',
        'For a price decrease: quantity jumps enough that P×Q rises — classic lecture diagram.',
        'Trap answer A describes inelastic or unit elastic intuition if you forget which side you’re on.',
      ],
      shortcut:
        'Under exam pressure: elastic → price cut can grow revenue; inelastic → price cut usually hurts revenue.',
    },
  },
  {
    id: 'bio-meiosis',
    correctCelebration: 'You nailed it — meiosis is the halving step before fertilisation.',
    field: 'Biology',
    meta: 'CELL 102 · Genetics · chromosome number',
    stem: 'Which process reduces the chromosome number by half before fertilisation in sexually reproducing organisms?',
    options: [
      { key: 'A', text: 'Meiosis' },
      { key: 'B', text: 'Mitosis' },
      { key: 'C', text: 'Binary fission' },
      { key: 'D', text: 'Budding' },
    ],
    correctKey: 'A',
    markingNote:
      'Meiosis produces gametes with half the diploid number so that fertilisation restores the full complement. Mitosis preserves chromosome number for growth and repair.',
    aiExplanation: {
      title: 'Exam-ready reasoning',
      bullets: [
        'Meiosis I separates homologous pairs — that’s where “halving” happens before gametes fuse.',
        'Mitosis keeps 2n in somatic cells; examiners love contrasting the two when stem says “before fertilisation”.',
        'Binary fission and budding are asexual strategies — wrong domain for sexual fertilisation.',
      ],
      shortcut:
        'See “halves before fertilisation” → think meiosis first; mitosis if the stem says growth/repair only.',
    },
  },
  {
    id: 'cs-binary-search',
    correctCelebration: 'Right — each probe halves the range: worst case O(log n).',
    field: 'Computer science',
    meta: 'CS 201 · Algorithms · complexity',
    stem: 'What is the worst-case time complexity of binary search on a sorted array of n elements?',
    options: [
      { key: 'A', text: 'O(n)' },
      { key: 'B', text: 'O(log n)' },
      { key: 'C', text: 'O(n log n)' },
      { key: 'D', text: 'O(1)' },
    ],
    correctKey: 'B',
    markingNote:
      'Binary search halves the search interval each step: at most ⌈log₂ n⌉ comparisons in the worst case.',
    aiExplanation: {
      title: 'Exam-ready reasoning',
      bullets: [
        'Each probe eliminates half the remaining range — that recurrence is logarithmic, not linear.',
        'O(n) would mean scanning every element; binary search never does that on a sorted array.',
        'O(n log n) is typical for efficient sorts, not for one search.',
      ],
      shortcut:
        'Sorted array + “halve each step” → O(log n); unsorted linear scan → O(n).',
    },
  },
  {
    id: 'phys-inertia',
    correctCelebration: 'Exactly — inertia is what resists changes in motion.',
    field: 'Physics',
    meta: 'PHY 101 · Mechanics · Newton’s laws',
    stem: 'Newton’s first law describes the tendency of an object to resist changes in motion. This property is called:',
    options: [
      { key: 'A', text: 'Weight' },
      { key: 'B', text: 'Mass density' },
      { key: 'C', text: 'Inertia' },
      { key: 'D', text: 'Momentum' },
    ],
    correctKey: 'C',
    markingNote:
      'Inertia is the resistance of matter to acceleration; mass quantifies it. Weight is a gravitational force; momentum is mass × velocity.',
    aiExplanation: {
      title: 'Exam-ready reasoning',
      bullets: [
        'First law: zero net force → constant velocity — objects “keep doing what they were doing” unless acted on.',
        'That stubbornness is inertia; mass measures how much force is needed for a given acceleration.',
        'Momentum is a different quantity (mv); don’t swap vocabulary under pressure.',
      ],
      shortcut:
        '“Resists change in motion” on MCQs → inertia; “force of gravity” → weight.',
    },
  },
  {
    id: 'law-judiciary',
    correctCelebration:
      'Correct — the judiciary interprets the Constitution and administers justice.',
    field: 'Law / governance',
    meta: 'POLI 110 · Ghana constitution · separation of powers',
    stem: 'In Ghana’s constitutional structure, which arm is primarily responsible for interpreting the Constitution and administering justice?',
    options: [
      { key: 'A', text: 'Executive' },
      { key: 'B', text: 'Legislature' },
      { key: 'C', text: 'Judiciary' },
      { key: 'D', text: 'Electoral Commission' },
    ],
    correctKey: 'C',
    markingNote:
      'The judiciary interprets law and resolves disputes; Parliament makes laws; the Executive implements policy; the EC runs elections.',
    aiExplanation: {
      title: 'Exam-ready reasoning',
      bullets: [
        'Interpretation of the Constitution and judicial review sit with the courts — core judiciary function.',
        'Legislature passes statutes; Executive enforces — neither is the primary interpreter in this framing.',
        'EC has an electoral mandate, not general constitutional interpretation.',
      ],
      shortcut:
        '“Interpret Constitution / administer justice” → Judiciary in separation-of-powers questions.',
    },
  },
] as const;

export function optionTextFor(
  demo: LandingDemoQuestion,
  key: OptionKey,
): string {
  return demo.options.find((o) => o.key === key)?.text ?? '';
}
