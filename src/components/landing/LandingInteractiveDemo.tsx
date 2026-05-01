'use client';

import {
  AnimatePresence,
  motion,
  useAnimation,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronUp,
  Flame,
  GraduationCap,
  PartyPopper,
  Sparkles,
  Target,
  XCircle,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  LANDING_DEMO_QUESTIONS,
  optionTextFor,
  type OptionKey,
} from '@/components/landing/demo-questions';
import { getMarketingBrandName } from '@/lib/landing-brand';

const BRAND = getMarketingBrandName();

/** Decorative float positions for “other subject” preview cards (desktop). */
const FLOAT_PREVIEW_SLOTS: readonly {
  top: string;
  left?: string;
  right?: string;
  rotate: number;
}[] = [
  { top: '1%', left: '0%', rotate: -3 },
  { top: '10%', right: '0%', rotate: 2.5 },
  { top: '36%', left: '-1%', rotate: 2 },
  { top: '50%', right: '-1%', rotate: -2.5 },
];

const DUO_GREEN = 'from-[#58cc02] to-emerald-500';

/** After the panel opens, wait for the reveal animation before “typing” begins. */
const AI_TYPING_DELAY_MS = 700;
const AI_TYPING_DELAY_REDUCED_MS = 0;
/** Milliseconds per character for the demo typewriter (landing only). */
const AI_CHAR_MS = 19;
const AI_CHAR_MS_FAST = 4;

const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 420, damping: 24 };

function distributeSegmentProgress(segments: readonly string[], charCount: number): string[] {
  let remaining = charCount;
  return segments.map((segment) => {
    if (remaining <= 0) return '';
    const take = Math.min(remaining, segment.length);
    remaining -= take;
    return segment.slice(0, take);
  });
}

function useSequentialTypewriter(
  segments: readonly string[],
  typingActive: boolean,
  reduceMotion: boolean | null,
  charIntervalMs: number,
  instantReveal: boolean,
) {
  const totalChars = useMemo(
    () => segments.reduce((sum, s) => sum + s.length, 0),
    [segments],
  );
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!typingActive) {
      setRevealed(0);
      return;
    }
    if (reduceMotion || instantReveal) {
      setRevealed(totalChars);
      return;
    }
    setRevealed(0);
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setRevealed(n);
      if (n >= totalChars) window.clearInterval(id);
    }, charIntervalMs);
    return () => window.clearInterval(id);
  }, [typingActive, totalChars, charIntervalMs, reduceMotion, instantReveal]);

  const partial = useMemo(
    () => distributeSegmentProgress(segments, revealed),
    [segments, revealed],
  );

  const isComplete = typingActive && revealed >= totalChars;
  return { partial, revealed, totalChars, isComplete };
}

function activeSegmentIndex(segments: readonly string[], revealedCount: number): number {
  let at = 0;
  for (let i = 0; i < segments.length; i++) {
    const end = at + segments[i].length;
    if (revealedCount < end) return i;
    at = end;
  }
  return -1;
}

const optionListVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const optionItemVariants = {
  hidden: { opacity: 1, x: -14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** No stagger / instant visible — keeps DOM semantics + `whileInView` under prefers-reduced-motion. */
const optionListVariantsReduced = {
  hidden: {},
  visible: { transition: { staggerChildren: 0, delayChildren: 0 } },
};

const optionItemVariantsReduced = {
  hidden: { opacity: 1, x: 0 },
  visible: { opacity: 1, x: 0 },
};

/** Lightweight burst — no canvas; draws attention on success (variable reward cue). */
function MiniConfetti({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();
  if (!active || reduceMotion) return null;
  const seeds = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      {seeds.map((i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-emerald-400 shadow-sm"
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: [0, 1, 0.6],
            x: Math.cos((i / seeds.length) * Math.PI * 2) * (48 + i * 8),
            y: Math.sin((i / seeds.length) * Math.PI * 2) * (48 + i * 6),
          }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: i * 0.02 }}
        />
      ))}
    </div>
  );
}

const STEM_SHAKE_INTRO_X = [0, -5, 5, -4, 4, -2, 2, 0];
const STEM_SHAKE_INTRO_ROTATE = [0, -0.35, 0.35, -0.22, 0.22, 0];
const STEM_SHAKE_WRONG_X = [0, -12, 12, -10, 10, -7, 7, -4, 4, 0];
const STEM_SHAKE_WRONG_ROTATE = [0, -1, 1, -0.85, 0.85, -0.45, 0.45, 0];

export function LandingInteractiveDemo() {
  const reduceMotion = useReducedMotion();
  const headingId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const stemRef = useRef<HTMLParagraphElement>(null);
  const stemControls = useAnimation();
  const sectionInView = useInView(sectionRef, { amount: 0.15, margin: '-80px 0px' });
  /** When the demo scrolls out of view, collapse the AI panel (no quiz reset). */
  const demoSectionVisible = useInView(sectionRef, { once: false, amount: 0.06 });
  const cardInView = useInView(cardRef, { amount: 0.35, margin: '-40px 0px' });
  const stemInView = useInView(stemRef, { once: true, amount: 0.45 });

  const [demoIndex, setDemoIndex] = useState(0);
  const demo = LANDING_DEMO_QUESTIONS[demoIndex] ?? LANDING_DEMO_QUESTIONS[0];

  const floatPreviews = useMemo(() => {
    return LANDING_DEMO_QUESTIONS.filter((_, i) => i !== demoIndex).slice(0, FLOAT_PREVIEW_SLOTS.length);
  }, [demoIndex]);

  const [choice, setChoice] = useState<OptionKey | null>(null);
  const [checked, setChecked] = useState(false);
  const [celebrateTick, setCelebrateTick] = useState(0);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiTypingActive, setAiTypingActive] = useState(false);
  /** True once the user has watched the typewriter finish at least once this attempt. */
  const [aiWalkthroughComplete, setAiWalkthroughComplete] = useState(false);
  /** When reopening after a full watch, show all copy immediately (no second typewriter). */
  const [aiPlaybackInstant, setAiPlaybackInstant] = useState(false);

  const aiTypeSegments = useMemo(
    () => [...demo.aiExplanation.bullets, demo.aiExplanation.shortcut] as const,
    [demo],
  );

  const correct = choice === demo.correctKey;
  const hasAnswer = choice !== null;

  useEffect(() => {
    setDemoIndex(Math.floor(Math.random() * LANDING_DEMO_QUESTIONS.length));
  }, []);

  useEffect(() => {
    setChoice(null);
    setChecked(false);
    setCelebrateTick(0);
    setAiPanelOpen(false);
    setAiTypingActive(false);
    setAiWalkthroughComplete(false);
    setAiPlaybackInstant(false);
  }, [demoIndex]);

  useEffect(() => {
    if (checked && correct) {
      setCelebrateTick((t) => t + 1);
    }
  }, [checked, correct]);

  useEffect(() => {
    if (!checked) {
      setAiPanelOpen(false);
      setAiTypingActive(false);
      setAiWalkthroughComplete(false);
      setAiPlaybackInstant(false);
    }
  }, [checked]);

  useEffect(() => {
    if (!aiPanelOpen) {
      setAiTypingActive(false);
      return;
    }
    if (aiPlaybackInstant) {
      setAiTypingActive(true);
      return;
    }
    const delay = reduceMotion ? AI_TYPING_DELAY_REDUCED_MS : AI_TYPING_DELAY_MS;
    const id = window.setTimeout(() => setAiTypingActive(true), delay);
    return () => window.clearTimeout(id);
  }, [aiPanelOpen, reduceMotion, aiPlaybackInstant]);

  const aiCharMs = reduceMotion ? AI_CHAR_MS_FAST : AI_CHAR_MS;
  const { partial: aiPartial, revealed: aiRevealed, isComplete: aiTypingComplete } =
    useSequentialTypewriter(
      aiTypeSegments,
      aiTypingActive,
      reduceMotion,
      aiCharMs,
      aiPlaybackInstant,
    );

  const activeAiSegment = useMemo(
    () => activeSegmentIndex(aiTypeSegments, aiRevealed),
    [aiTypeSegments, aiRevealed],
  );

  useEffect(() => {
    if (aiTypingComplete && aiPanelOpen) setAiWalkthroughComplete(true);
  }, [aiTypingComplete, aiPanelOpen]);

  useEffect(() => {
    if (!stemInView || reduceMotion) return;
    stemControls.start({
      x: STEM_SHAKE_INTRO_X,
      rotate: STEM_SHAKE_INTRO_ROTATE,
      transition: { duration: 0.52, ease: 'easeInOut' },
    });
  }, [stemInView, reduceMotion, stemControls]);

  useEffect(() => {
    if (!checked || correct || reduceMotion) return;
    stemControls.start({
      x: STEM_SHAKE_WRONG_X,
      rotate: STEM_SHAKE_WRONG_ROTATE,
      transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
    });
  }, [checked, correct, reduceMotion, stemControls]);

  const onCheck = useCallback(() => {
    if (!hasAnswer) return;
    setChecked(true);
  }, [hasAnswer]);

  const reset = useCallback(() => {
    setChoice(null);
    setChecked(false);
    setCelebrateTick(0);
    setAiPanelOpen(false);
    setAiTypingActive(false);
    setAiWalkthroughComplete(false);
    setAiPlaybackInstant(false);
  }, []);

  const openAiPanel = useCallback(() => {
    if (aiWalkthroughComplete) {
      setAiPlaybackInstant(true);
      setAiTypingActive(true);
      setAiPanelOpen(true);
      return;
    }
    setAiPlaybackInstant(false);
    setAiPanelOpen(true);
  }, [aiWalkthroughComplete]);

  const collapseAiPanel = useCallback(() => {
    setAiPanelOpen(false);
    setAiTypingActive(false);
  }, []);

  useEffect(() => {
    if (!demoSectionVisible) collapseAiPanel();
  }, [demoSectionVisible, collapseAiPanel]);

  const bulletPartials = aiPartial.slice(0, demo.aiExplanation.bullets.length);
  const shortcutPartial = aiPartial[demo.aiExplanation.bullets.length] ?? '';

  const copyVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.08,
        delayChildren: reduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="try-it"
      className="relative scroll-mt-28 overflow-hidden border-t border-[var(--border-subtle)] bg-bg-base py-20 sm:py-24 lg:py-28"
      aria-labelledby={headingId}
    >
      {/* Ambient depth — slightly intensifies when section is in view (orientation reflex). */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(45,212,191,0.09),transparent_55%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(45,212,191,0.06),transparent_55%)]"
        aria-hidden
        style={{ opacity: sectionInView ? 1 : 0.78 }}
      />

      {/* Other subjects — decorative previews scattered behind the main card (desktop). */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[4.5rem] z-[1] hidden min-h-[28rem] lg:block lg:top-[5rem]"
        aria-hidden
      >
        {floatPreviews.map((q, i) => {
          const slot = FLOAT_PREVIEW_SLOTS[i];
          if (!slot) return null;
          const snippet =
            q.stem.length > 88 ? `${q.stem.slice(0, 88).trim()}…` : q.stem;
          return (
            <div
              key={q.id}
              className="absolute max-w-[min(220px,18vw)] rounded-xl border border-teal-500/20 bg-bg-surface/75 px-3 py-2.5 shadow-md backdrop-blur-md dark:border-teal-500/15 dark:bg-bg-surface/55"
              style={{
                top: slot.top,
                left: slot.left,
                right: slot.right,
                transform: `rotate(${slot.rotate}deg)`,
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                {q.field}
              </p>
              <p className="mt-1 line-clamp-3 text-[11px] leading-snug text-text-secondary">{snippet}</p>
            </div>
          );
        })}
      </div>

      <div className="relative z-[2] mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-14">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-12%' }}
            variants={copyVariants}
          >
            <motion.p
              variants={itemVariants}
              className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/[0.07] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300"
            >
              <motion.span
                animate={
                  reduceMotion || !sectionInView
                    ? undefined
                    : { scale: [1, 1.06, 1], rotate: [0, -4, 4, 0] }
                }
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex"
              >
                <Zap className="h-3.5 w-3.5 text-orange-500" aria-hidden />
              </motion.span>
              Quick win — 30 seconds
            </motion.p>
            <motion.p
              variants={itemVariants}
              className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-orange-600 dark:text-orange-400/95"
            >
              Interactive demo
            </motion.p>
            <motion.h2
              variants={itemVariants}
              id={headingId}
              className="mt-2 text-balance font-[Outfit,system-ui,sans-serif] text-3xl font-semibold leading-tight tracking-tight text-text-primary sm:text-4xl"
            >
              Try a question—see marking and an AI solution
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-text-secondary sm:text-lg"
            >
              Pick an answer, see what an examiner would highlight, then read a step-by-step AI walkthrough—
              the same rhythm you get inside {BRAND}.
            </motion.p>
            <motion.ul variants={itemVariants} className="mt-8 space-y-3 text-sm text-text-secondary">
              <li className="flex gap-3">
                <Target className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
                <span>
                  <span className="font-medium text-text-primary">Instant feedback</span> — same dopamine hit
                  as levelling up in bite-sized apps (designed for exam nerves, not vanity metrics).
                </span>
              </li>
              <li className="flex gap-3">
                <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
                <span>Short marking note—what an official key might stress.</span>
              </li>
              <li className="flex gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
                <span>
                  <span className="font-medium text-text-primary">AI solution</span> walks through the logic so
                  you know why the key is right—not just that it is.
                </span>
              </li>
            </motion.ul>
            <motion.div variants={itemVariants} className="mt-8">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl border border-orange-500/35 bg-orange-500/[0.07] px-4 py-2.5 text-sm font-semibold text-orange-800 transition hover:bg-orange-500/[0.12] dark:border-orange-500/25 dark:bg-orange-950/40 dark:text-orange-200 dark:hover:bg-orange-950/60"
              >
                Sign up for full banks
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            ref={cardRef}
            className="relative"
            initial={reduceMotion ? false : { opacity: 0, y: 44 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-12%' }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="pointer-events-none absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-teal-500/25 via-transparent to-orange-500/20 opacity-90 blur-sm dark:from-teal-400/15 dark:to-orange-500/15"
              aria-hidden
            />
            {/* Attention ring when card scrolls into view — curiosity gap. */}
            <motion.div
              className="pointer-events-none absolute -inset-[3px] rounded-[1.4rem] border-2 border-orange-400/0 sm:rounded-[1.55rem]"
              initial={false}
              animate={
                cardInView && !checked
                  ? { borderColor: ['rgba(251,146,60,0)', 'rgba(251,146,60,0.35)', 'rgba(251,146,60,0)'] }
                  : { borderColor: 'rgba(251,146,60,0)' }
              }
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            />

            <div
              className="relative overflow-hidden rounded-[1.25rem] border-2 shadow-[0_28px_80px_-24px_rgba(15,23,42,0.18)] dark:shadow-[0_36px_90px_-28px_rgba(0,0,0,0.55)] sm:rounded-3xl"
              style={{
                background: 'var(--quiz-card-bg)',
                borderColor: 'var(--quiz-card-border)',
              }}
            >
              {/* Micro-progress — completion bias (single question still feels “finishable”). */}
              <div
                className="border-b px-4 py-2 sm:px-5"
                style={{ borderColor: 'var(--quiz-card-border)', background: 'var(--quiz-nav-header-bg)' }}
              >
                <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-[color:var(--quiz-label)]">
                  <span>Your progress</span>
                  <span>{checked ? '1 / 1' : '0 / 1'}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200/90">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${
                      checked
                        ? correct
                          ? 'from-emerald-500 to-teal-500'
                          : 'from-red-500 to-rose-600'
                        : 'from-orange-400 to-amber-400'
                    }`}
                    initial={{ width: '4%' }}
                    animate={{ width: checked ? '100%' : '18%' }}
                    transition={SPRING_SNAPPY}
                  />
                </div>
              </div>

              <div
                className="flex items-center justify-between border-b px-4 py-3 sm:px-5"
                style={{
                  borderColor: 'var(--quiz-card-border)',
                  background: 'var(--quiz-nav-header-bg)',
                }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/25">
                    <GraduationCap className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[color:var(--quiz-heading)]">
                      Practice question
                    </p>
                    <p className="truncate text-[11px] text-[color:var(--quiz-muted)]">{demo.meta}</p>
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--quiz-label)]"
                  style={{ borderColor: 'var(--quiz-card-border)' }}
                >
                  Demo
                </span>
              </div>

              <div className="relative space-y-4 px-4 py-5 sm:px-6 sm:py-6">
                <MiniConfetti active={checked && correct && celebrateTick > 0} />

                <motion.p
                  ref={stemRef}
                  animate={reduceMotion ? undefined : stemControls}
                  className="font-[Outfit,system-ui,sans-serif] text-[0.95rem] font-semibold leading-snug sm:text-base [color:var(--quiz-heading)]"
                >
                  {demo.stem}
                </motion.p>

                <motion.div
                  className="space-y-2.5"
                  role="radiogroup"
                  aria-label="Answer choices"
                  variants={reduceMotion ? optionListVariantsReduced : optionListVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25, margin: '0px 0px -10% 0px' }}
                >
                  {demo.options.map((opt) => {
                    const isSelected = choice === opt.key;
                    const showResult = checked && hasAnswer;
                    const isCorrectOpt = opt.key === demo.correctKey;
                    const wrongPick = showResult && isSelected && !isCorrectOpt;
                    /** Revealed distractors — keep light “paper” fills so `--quiz-body` never sits on dark surfaces. */
                    const neutralRevealed = showResult && !isCorrectOpt && !wrongPick;

                    return (
                      <motion.button
                        key={opt.key}
                        layout
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={checked}
                        variants={reduceMotion ? optionItemVariantsReduced : optionItemVariants}
                        whileHover={
                          checked || reduceMotion ? undefined : { scale: 1.015, transition: { duration: 0.2 } }
                        }
                        whileTap={checked || reduceMotion ? undefined : { scale: 0.985 }}
                        onClick={() => !checked && setChoice(opt.key)}
                        className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left text-sm leading-snug transition-colors sm:px-4 ${
                          showResult && isCorrectOpt
                            ? 'border-emerald-400/60 bg-emerald-50 shadow-[0_0_0_1px_rgba(16,185,129,0.18)]'
                            : wrongPick
                              ? 'border-rose-400/55 bg-rose-50 shadow-[0_0_0_1px_rgba(244,63,94,0.14)]'
                              : neutralRevealed
                                ? 'border-slate-200 bg-white shadow-sm'
                                : isSelected
                                  ? 'border-teal-400/55 bg-teal-50/95'
                                  : 'border-slate-200/90 bg-white hover:border-teal-300/45 hover:bg-teal-50/40'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            showResult && isCorrectOpt
                              ? 'bg-[#58cc02] text-white shadow-sm'
                              : wrongPick
                                ? 'bg-red-600 text-white shadow-sm'
                                : neutralRevealed
                                  ? 'border border-slate-300 bg-white text-slate-700 shadow-sm'
                                  : isSelected
                                    ? 'bg-teal-600 text-white'
                                    : 'border border-slate-300 bg-slate-100 text-slate-700'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className={wrongPick ? 'text-slate-900' : 'text-slate-800'}>{opt.text}</span>
                        {showResult && isCorrectOpt ? (
                          <CheckCircle2
                            className="ml-auto mt-0.5 h-5 w-5 shrink-0 text-[#58cc02]"
                            aria-hidden
                          />
                        ) : null}
                        {wrongPick ? (
                          <XCircle
                            className="ml-auto mt-0.5 h-5 w-5 shrink-0 text-red-600"
                            aria-hidden
                          />
                        ) : null}
                      </motion.button>
                    );
                  })}
                </motion.div>

                {!checked ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <motion.button
                      type="button"
                      onClick={onCheck}
                      disabled={!hasAnswer}
                      whileHover={!hasAnswer || reduceMotion ? undefined : { scale: 1.02 }}
                      whileTap={!hasAnswer || reduceMotion ? undefined : { scale: 0.98 }}
                      className="btn-primary-sweep inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(234,88,12,0.22)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:from-orange-500 dark:to-amber-500"
                    >
                      Check answer
                    </motion.button>
                    <p className="text-center text-xs text-[color:var(--quiz-label)] sm:text-left">
                      One decision away—your brain loves finishing loops this small.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={correct ? 'ok' : 'retry'}
                        role="status"
                        layout
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96, y: -8 }}
                        transition={SPRING_SNAPPY}
                        className={
                          correct
                            ? `relative overflow-hidden rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-br ${DUO_GREEN} px-4 py-4 text-white shadow-lg shadow-emerald-500/25 sm:px-5 sm:py-5`
                            : 'relative overflow-hidden rounded-2xl border-2 border-rose-200/90 bg-gradient-to-br from-rose-50 via-white to-rose-100/95 px-4 py-4 text-rose-950 shadow-[0_14px_44px_-18px_rgba(190,18,60,0.18),inset_0_1px_0_0_rgba(255,255,255,0.9)] sm:px-5 sm:py-5'
                        }
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                          <motion.div
                            className={
                              correct
                                ? 'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm'
                                : 'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 backdrop-blur-sm ring-1 ring-rose-200/80'
                            }
                            initial={reduceMotion ? false : { rotate: -12, scale: 0.8 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ ...SPRING_SNAPPY, delay: 0.05 }}
                          >
                            {correct ? (
                              <PartyPopper className="h-8 w-8 text-white" strokeWidth={2} aria-hidden />
                            ) : (
                              <XCircle className="h-8 w-8 text-rose-600" strokeWidth={2} aria-hidden />
                            )}
                          </motion.div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`font-[Outfit,system-ui,sans-serif] text-xl font-bold tracking-tight ${
                                correct ? '' : 'text-rose-950'
                              }`}
                            >
                              {correct ? 'Nice!' : 'Not quite'}
                            </p>
                            {correct ? (
                              <p className="mt-1 text-sm font-medium leading-snug text-white/95">
                                {demo.correctCelebration ??
                                  'That matches what examiners expect — nice work.'}
                              </p>
                            ) : choice ? (
                              <div className="mt-2 space-y-2 text-sm font-medium leading-snug text-rose-900">
                                <p>
                                  <span className="text-rose-700">Your answer: </span>
                                  <span className="font-bold text-rose-950">{choice}</span>
                                  <span className="text-rose-900">
                                    {' '}
                                    — {optionTextFor(demo, choice)}
                                  </span>
                                </p>
                                <p>
                                  <span className="text-rose-700">Correct answer: </span>
                                  <span className="font-bold text-rose-950">{demo.correctKey}</span>
                                  <span className="text-rose-900">
                                    {' '}
                                    — {optionTextFor(demo, demo.correctKey)}
                                  </span>
                                </p>
                              </div>
                            ) : null}
                            {correct ? (
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, ...SPRING_SNAPPY }}
                                className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/25 px-3 py-1.5 text-xs font-bold uppercase tracking-wide backdrop-blur-sm"
                              >
                                <Flame className="h-4 w-4 text-amber-200" aria-hidden />
                                +10 understanding · demo XP
                              </motion.div>
                            ) : (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.12 }}
                                className="mt-3 text-xs font-medium text-rose-800"
                              >
                                Compare your pick with the key above—then tap{' '}
                                <span className="font-semibold text-rose-950">
                                  Show AI solution
                                </span>{' '}
                                when you’re ready.
                              </motion.p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08, duration: 0.35 }}
                      className="rounded-xl border border-slate-200/90 bg-slate-50 px-4 py-3 shadow-sm"
                      style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.04)' }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Marking insight
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">{demo.markingNote}</p>
                    </motion.div>

                    <div
                      className="overflow-hidden rounded-2xl border border-teal-200/70 bg-gradient-to-br from-teal-50/95 via-white to-sky-50/40"
                      role="region"
                      aria-label="AI solution"
                      aria-busy={
                        aiPanelOpen && aiTypingActive && !aiTypingComplete && !reduceMotion ? true : false
                      }
                    >
                      <div className="flex items-start gap-3 border-b border-teal-200/60 bg-teal-50/70 px-4 py-3.5 sm:px-5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/25">
                          <Brain className="h-4 w-4" strokeWidth={2} aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="text-sm font-semibold text-teal-950">AI solution</p>
                          <p className="text-xs text-teal-800">Why the mark scheme picks this option</p>
                        </div>
                        {aiPanelOpen ? (
                          <motion.button
                            type="button"
                            onClick={collapseAiPanel}
                            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-teal-300/60 bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-teal-900 transition hover:bg-teal-50"
                            aria-expanded={aiPanelOpen}
                          >
                            Hide
                            <ChevronUp className="h-3.5 w-3.5 opacity-90" aria-hidden />
                          </motion.button>
                        ) : null}
                      </div>

                      {!aiPanelOpen ? (
                        <div className="px-4 pb-4 pt-1 sm:px-5">
                          <motion.button
                            type="button"
                            onClick={openAiPanel}
                            whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                            whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-400/45 bg-white px-4 py-3 text-sm font-semibold text-teal-900 shadow-sm transition hover:bg-teal-50"
                          >
                            <Sparkles className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                            {aiWalkthroughComplete ? 'Show AI solution again' : 'Show AI solution'}
                          </motion.button>
                          <p className="mt-2 text-center text-[11px] text-teal-800 sm:text-left">
                            {aiWalkthroughComplete
                              ? 'Reopens instantly with the full walkthrough.'
                              : 'Opens a typed walkthrough—on your timing.'}
                          </p>
                        </div>
                      ) : (
                        <AnimatePresence initial={false}>
                          <motion.div
                            key="ai-reveal"
                            initial={
                              reduceMotion ? false : { opacity: 0, y: 28, scale: 0.97, filter: 'blur(8px)' }
                            }
                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                            transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
                            className="border-t border-teal-500/15 px-4 pb-5 pt-4 sm:px-5"
                          >
                            <motion.div
                              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: reduceMotion ? 0 : 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                              className="space-y-4"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/60 bg-teal-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-900">
                                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                                  {demo.aiExplanation.title}
                                </span>
                              </div>
                              {!aiTypingActive ? (
                                <div
                                  className="flex min-h-[6.5rem] flex-col justify-center rounded-xl border border-dashed border-teal-300/50 bg-teal-50/40 px-4 py-6"
                                  aria-hidden
                                >
                                  <div className="mx-auto flex gap-1">
                                    {[0, 1, 2].map((d) => (
                                      <motion.span
                                        key={d}
                                        className="h-1.5 w-1.5 rounded-full bg-teal-500"
                                        animate={
                                          reduceMotion ? undefined : { opacity: [0.25, 1, 0.25], y: [0, -3, 0] }
                                        }
                                        transition={{
                                          duration: 1.1,
                                          repeat: reduceMotion ? 0 : Infinity,
                                          delay: d * 0.18,
                                          ease: 'easeInOut',
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <ul className="space-y-3">
                                    {demo.aiExplanation.bullets.map((_, i) => (
                                      <li
                                        key={i}
                                        className="flex gap-3 text-sm leading-relaxed text-slate-800"
                                      >
                                        <CheckCircle2
                                          className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 opacity-90"
                                          strokeWidth={2}
                                          aria-hidden
                                        />
                                        <span className="min-w-0">
                                          {bulletPartials[i]}
                                          {aiTypingActive &&
                                          !aiTypingComplete &&
                                          !reduceMotion &&
                                          activeAiSegment === i ? (
                                            <motion.span
                                              aria-hidden
                                              className="ml-px inline-block h-[1.1em] w-0.5 translate-y-px bg-teal-600 align-middle"
                                              animate={{ opacity: [1, 0.15, 1] }}
                                              transition={{
                                                duration: 0.85,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                              }}
                                            />
                                          ) : null}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                  <p className="rounded-lg border border-dashed border-teal-300/55 bg-teal-50/60 px-3 py-2.5 text-xs leading-relaxed text-slate-800">
                                    <span className="font-semibold text-slate-900">Exam shortcut: </span>
                                    {shortcutPartial}
                                    {aiTypingActive &&
                                    !aiTypingComplete &&
                                    !reduceMotion &&
                                    activeAiSegment === demo.aiExplanation.bullets.length ? (
                                      <motion.span
                                        aria-hidden
                                        className="ml-px inline-block h-[1.1em] w-0.5 translate-y-px bg-teal-600 align-middle"
                                        animate={{ opacity: [1, 0.15, 1] }}
                                        transition={{
                                          duration: 0.85,
                                          repeat: Infinity,
                                          ease: 'easeInOut',
                                        }}
                                      />
                                    ) : null}
                                  </p>
                                </>
                              )}
                            </motion.div>
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>

                    <motion.button
                      type="button"
                      onClick={reset}
                      whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                      className="w-full rounded-xl border border-[var(--quiz-card-border)] bg-transparent py-2.5 text-sm font-medium text-[color:var(--quiz-label)] transition hover:bg-slate-100/90"
                    >
                      Try again
                    </motion.button>

                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06, duration: 0.35 }}
                      className="rounded-2xl border border-orange-200/90 bg-gradient-to-br from-orange-50 to-amber-50/70 p-4 shadow-sm sm:p-5"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        Ready for thousands of exam-style questions?
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        Create a free account to unlock full past-paper banks, AI walkthroughs, and progress across
                        your courses.
                      </p>
                      <Link
                        href="/register"
                        className="btn-primary-sweep mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(234,88,12,0.22)] transition hover:brightness-105 dark:from-orange-500 dark:to-amber-500"
                      >
                        Create free account
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
