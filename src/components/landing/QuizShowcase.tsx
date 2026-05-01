'use client';

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const qStates: Record<
  number,
  { bg: string; fg: string; border: string }
> = {
  1: { bg: 'var(--quiz-nav-muted)', fg: 'var(--quiz-nav-muted-fg)', border: 'var(--quiz-nav-border)' },
  2: { bg: 'var(--quiz-flag-bg)', fg: 'var(--quiz-flag-fg)', border: 'var(--quiz-flag-border)' },
  3: { bg: 'var(--quiz-current-bg)', fg: 'var(--quiz-current-fg)', border: 'var(--quiz-current-bg)' },
  4: { bg: 'var(--quiz-nav-muted)', fg: 'var(--quiz-nav-muted-fg)', border: 'var(--quiz-nav-border)' },
  5: { bg: 'var(--quiz-nav-muted)', fg: 'var(--quiz-nav-muted-fg)', border: 'var(--quiz-nav-border)' },
  6: { bg: 'var(--quiz-nav-muted)', fg: 'var(--quiz-nav-muted-fg)', border: 'var(--quiz-nav-border)' },
  7: { bg: 'var(--quiz-nav-muted)', fg: 'var(--quiz-nav-muted-fg)', border: 'var(--quiz-nav-border)' },
  8: { bg: 'var(--quiz-nav-muted)', fg: 'var(--quiz-nav-muted-fg)', border: 'var(--quiz-nav-border)' },
  9: {
    bg: 'var(--quiz-answered-bg)',
    fg: 'var(--quiz-answered-fg)',
    border: 'var(--quiz-answered-border)',
  },
  10: { bg: 'var(--quiz-nav-muted)', fg: 'var(--quiz-nav-muted-fg)', border: 'var(--quiz-nav-border)' },
  11: { bg: 'var(--quiz-nav-muted)', fg: 'var(--quiz-nav-muted-fg)', border: 'var(--quiz-nav-border)' },
  12: { bg: 'var(--quiz-nav-muted)', fg: 'var(--quiz-nav-muted-fg)', border: 'var(--quiz-nav-border)' },
};

const springView = { once: true as const, margin: '-12%' as const };

export function QuizShowcase() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start end', 'end start'],
  });

  const floatY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduceMotion ? [0, 0, 0] : [36, 0, -28],
  );
  const floatY2 = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduceMotion ? [0, 0, 0] : [18, 0, -22],
  );
  /** Keep the card visually stable (no extra parallax) — the scroll section is already tall. */
  const cardY = useTransform(scrollYProgress, [0, 1], [0, 0]);

  const glowPulse = reduceMotion
    ? {}
    : {
        scale: [1, 1.06, 1],
        opacity: [0.11, 0.16, 0.11],
      };

  return (
    <div
      ref={rootRef}
      className="relative mx-auto flex min-h-[min(400px,68vw)] w-full max-w-2xl flex-col items-center justify-center sm:min-h-[440px] lg:max-w-none lg:min-h-[min(480px,70vh)] lg:justify-end xl:min-h-[500px]"
    >
      {/* Ambient glow — breathing */}
      <motion.div
        className="pointer-events-none absolute bg-teal-500/18 dark:bg-teal-400/12"
        style={{
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          width: 'min(480px, 95vw)',
          height: 'min(480px, 95vw)',
          right: '-12%',
          top: '50%',
          translateY: '-50%',
        }}
        animate={glowPulse}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.96 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        viewport={springView}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        style={{ y: cardY }}
        className="relative z-[1] w-[min(100%,100%)] max-w-[420px] sm:max-w-[460px] lg:max-w-[min(100%,520px)] xl:max-w-[560px]"
      >
        <div
          className="pointer-events-none absolute -inset-1 rounded-[1.35rem] bg-gradient-to-br from-teal-400/28 via-cyan-400/12 to-transparent opacity-90 blur-md dark:from-teal-500/22 dark:via-cyan-500/10 dark:to-transparent"
          aria-hidden
        />
        <p className="mb-3 w-full text-center text-[11px] font-bold uppercase tracking-[0.2em] text-teal-800 [letter-spacing:0.14em] dark:text-teal-300/95">
          Live preview
        </p>

        <div
          className="relative overflow-hidden rounded-[1.25rem] border-2 shadow-[0_32px_80px_-12px_rgba(15,23,42,0.2),0_0_0_1px_rgba(15,118,110,0.14)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.65),0_0_0_1px_rgba(45,212,191,0.08)] sm:rounded-3xl"
          style={{
            background: 'var(--quiz-card-bg)',
            borderColor: 'var(--quiz-card-border)',
          }}
        >
          <div
            className="border-b px-5 py-4 sm:px-6 sm:py-4"
            style={{
              background: 'var(--quiz-nav-header-bg)',
              borderColor: 'var(--quiz-card-border)',
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span
                className="text-sm font-bold tracking-tight sm:text-[15px]"
                style={{ color: 'var(--quiz-heading)' }}
              >
                Questions
              </span>
              <span
                className="rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:text-xs"
                style={{
                  borderColor: 'var(--quiz-card-border)',
                  background: 'var(--quiz-card-bg)',
                  color: 'var(--quiz-muted)',
                }}
              >
                2/20
              </span>
            </div>
            <div className="mb-3 grid grid-cols-6 gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => {
                const s = qStates[n]!;
                return (
                  <motion.div
                    key={n}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-5%' }}
                    transition={{
                      delay: reduceMotion ? 0 : 0.028 * n,
                      type: 'spring',
                      stiffness: 380,
                      damping: 22,
                    }}
                    className="flex min-h-[2.35rem] items-center justify-center rounded-lg border text-[11px] font-semibold tabular-nums sm:min-h-[2.5rem] sm:text-xs"
                    style={{
                      background: s.bg,
                      color: s.fg,
                      borderColor: s.border,
                    }}
                  >
                    {n}
                  </motion.div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {[
                { key: 'cur', label: 'Current', dot: 'var(--quiz-current-bg)' },
                { key: 'flg', label: 'Flagged', dot: 'var(--quiz-flag-dot)' },
                { key: 'ans', label: 'Answered', dot: 'var(--quiz-answered-fg)' },
                { key: 'un', label: 'Unanswered', dot: 'var(--quiz-muted)' },
              ].map((l) => (
                <div key={l.key} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ background: l.dot }} />
                  <span className="text-[10px] font-medium sm:text-[11px]" style={{ color: 'var(--quiz-label)' }}>
                    {l.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 py-4 sm:px-6 sm:py-5">
            <p
              className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px]"
              style={{ color: 'var(--quiz-label)' }}
            >
              Question
            </p>
            <p
              className="mb-4 text-[15px] font-medium leading-relaxed sm:text-base lg:text-[17px]"
              style={{ color: 'var(--quiz-body)' }}
            >
              ________ is the application of the know-how one has for the benefit of the society.
            </p>
            <p
              className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px]"
              style={{ color: 'var(--quiz-label)' }}
            >
              Options
            </p>
            <div className="flex flex-col gap-2 sm:gap-2.5">
              {[
                { letter: 'A', text: 'Knowledge', selected: true },
                { letter: 'B', text: 'Wisdom', selected: false },
                { letter: 'C', text: 'Data', selected: false },
                { letter: 'D', text: 'Information', selected: false },
              ].map((opt, idx) => (
                <motion.div
                  key={opt.letter}
                  initial={reduceMotion ? false : { opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: reduceMotion ? 0 : 0.35 + idx * 0.06, duration: 0.4 }}
                  whileHover={reduceMotion || !opt.selected ? undefined : { scale: 1.01 }}
                  className="flex items-center gap-3 rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3"
                  style={{
                    background: opt.selected ? 'var(--quiz-opt-selected-bg)' : 'var(--quiz-card-bg)',
                    borderColor: opt.selected ? 'var(--quiz-opt-selected-border)' : 'var(--quiz-card-border)',
                    boxShadow: opt.selected ? '0 0 0 2px rgba(15,118,110,0.12)' : undefined,
                  }}
                >
                  <motion.div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold sm:h-8 sm:w-8 sm:text-xs"
                    style={{
                      background: opt.selected ? 'var(--quiz-current-bg)' : 'var(--quiz-nav-header-bg)',
                      color: opt.selected ? '#fff' : 'var(--quiz-body)',
                    }}
                    animate={
                      opt.selected && !reduceMotion
                        ? {
                            boxShadow: [
                              '0 0 0 0 rgba(15,118,110,0.35)',
                              '0 0 0 8px rgba(15,118,110,0)',
                            ],
                          }
                        : {}
                    }
                    transition={
                      opt.selected && !reduceMotion
                        ? { duration: 2.2, repeat: Infinity, ease: 'easeOut' }
                        : {}
                    }
                  >
                    {opt.letter}
                  </motion.div>
                  <span
                    className="text-[14px] sm:text-[15px]"
                    style={{
                      color: opt.selected ? 'var(--quiz-current-bg)' : 'var(--quiz-body)',
                      fontWeight: opt.selected ? 700 : 500,
                    }}
                  >
                    {opt.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute left-[min(52%,200px)] top-[10%] z-[2] sm:left-[56%] lg:left-[min(52%,228px)]"
        style={{ y: floatY }}
      >
        <motion.div
          className="w-[min(calc(100vw-2rem),260px)] sm:w-[260px]"
          initial={reduceMotion ? false : { opacity: 0, x: 24, scale: 0.92 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={springView}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className={`rounded-2xl border-2 border-teal-400/25 bg-bg-surface px-3.5 py-3 shadow-[var(--shadow-float)] dark:border-teal-500/20 sm:px-4 sm:py-3.5 ${reduceMotion ? '' : 'quiz-showcase-chip-float'}`}
          >
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  XP earned
                </p>
                <p className="mt-1 text-[11px] font-medium leading-snug text-text-secondary">
                  3 correct · Level 12
                </p>
              </div>
              <motion.p
                className="shrink-0 font-mono text-[1.65rem] font-bold leading-none tabular-nums sm:text-[1.85rem]"
                style={{ color: 'var(--brand-orange)' }}
                initial={false}
                animate={reduceMotion ? {} : { scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                +45
              </motion.p>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-bg-raised ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-teal-600 to-cyan-500"
                initial={{ width: 0 }}
                whileInView={{ width: '62%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-[5%] left-[min(42%,160px)] z-[2] sm:bottom-[7%] sm:left-[48%]"
        style={{ y: floatY2 }}
      >
        <motion.div
          className="w-[min(calc(100vw-2rem),268px)] sm:w-[268px]"
          initial={reduceMotion ? false : { opacity: 0, x: -20, scale: 0.94 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={springView}
          transition={{ duration: 0.55, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className={`flex gap-2.5 rounded-2xl border-2 border-amber-300/60 bg-amber-50/95 px-3 py-2.5 shadow-lg backdrop-blur-[2px] dark:border-amber-500/30 dark:bg-bg-surface sm:gap-3 sm:px-3.5 sm:py-3 ${reduceMotion ? '' : 'quiz-showcase-chip-float-delayed'}`}
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-400/35 dark:bg-amber-500/10 dark:ring-amber-500/25">
              <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.75)]" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="text-[11px] font-bold leading-tight tracking-tight sm:text-xs"
                style={{ color: 'var(--quiz-flag-fg)' }}
              >
                Flagged for review
              </p>
              <p className="mt-0.5 text-[11px] font-medium leading-snug text-text-secondary sm:text-[11.5px]">
                Q2 marked — revisit before you submit
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="relative z-[5] mx-auto mt-10 flex w-full justify-center px-3 sm:mt-14 lg:mt-16">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-full border border-teal-500/35 bg-teal-500/[0.08] px-5 py-2.5 text-sm font-semibold text-teal-900 shadow-sm transition hover:bg-teal-500/[0.14] dark:border-teal-500/30 dark:bg-teal-950/45 dark:text-teal-100"
        >
          Sign up to sit timed quizzes
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
