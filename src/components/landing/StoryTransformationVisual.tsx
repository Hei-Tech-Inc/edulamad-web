'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  FileText,
  FileWarning,
  Minus,
  Plus,
  Search,
  Timer,
  TrendingUp,
} from 'lucide-react';

type StoryTransformationVisualProps = {
  brand: string;
};

/** Shared stem — PDF mock ends with … ; app card shows full line + options. */
const DEMO_STEM =
  'When the price elasticity of demand is greater than 1, a decrease in price will most likely:';

function StepLabel({
  step,
  variant,
  title,
  subtitle,
}: {
  step: number;
  variant: 'before' | 'middle' | 'after';
  title: string;
  subtitle: string;
}) {
  const ring =
    variant === 'before'
      ? 'bg-red-500/18 text-red-800 ring-1 ring-red-500/25 dark:bg-red-500/25 dark:text-red-100 dark:ring-red-500/35'
      : variant === 'middle'
        ? 'bg-teal-500/18 text-teal-900 ring-1 ring-teal-500/30 dark:bg-teal-500/25 dark:text-teal-100 dark:ring-teal-400/35'
        : 'bg-emerald-500/15 text-emerald-950 ring-1 ring-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-50 dark:ring-emerald-400/30';

  return (
    <div className="flex items-start gap-3 sm:gap-4 md:flex-col md:items-center md:text-center">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold tabular-nums ${ring}`}
        aria-hidden
      >
        {step}
      </span>
      <div className="min-w-0 md:max-w-[14rem]">
        <p className="font-[Outfit,system-ui,sans-serif] text-base font-semibold leading-snug text-text-primary">
          {title}
        </p>
        <p className="mt-1 text-sm leading-snug text-text-secondary">{subtitle}</p>
      </div>
    </div>
  );
}

const benefitPills = [
  {
    icon: Search,
    label: 'Searchable past papers',
    hint: 'Course · year · topic',
  },
  {
    icon: Timer,
    label: 'Timed exam mode',
    hint: 'Same pressure as the hall',
  },
  {
    icon: TrendingUp,
    label: 'Topic-level stats',
    hint: 'Revise where you leak marks',
  },
] as const;

export function StoryTransformationVisual({ brand }: StoryTransformationVisualProps) {
  const reduceMotion = useReducedMotion();

  const enter = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-60px' },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section
      className="mt-12 sm:mt-14"
      aria-labelledby="story-transformation-heading"
    >
      <div className="mx-auto max-w-5xl rounded-[1.75rem] border border-[var(--border-default)] bg-gradient-to-b from-bg-surface via-bg-surface/95 to-bg-base/90 px-4 py-8 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.2)] ring-1 ring-teal-500/[0.07] dark:from-bg-surface/60 dark:via-bg-base/50 dark:to-bg-base dark:shadow-[0_28px_80px_-48px_rgba(0,0,0,0.55)] dark:ring-teal-400/10 sm:px-6 sm:py-10 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-400 sm:text-[13px]">
            How we’re different
          </p>
          <h3
            id="story-transformation-heading"
            className="mt-3 font-[Outfit,system-ui,sans-serif] text-[1.35rem] font-semibold leading-[1.15] tracking-tight text-text-primary sm:text-2xl lg:text-[1.75rem]"
          >
            Same exam paper. Two totally different experiences.
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-text-secondary sm:mt-4 sm:text-base">
            On the left is how papers usually live today—scans and files scattered across chats. On
            the right is what students get inside{' '}
            <span className="font-semibold text-text-primary">{brand}</span>: the question extracted,
            choices you can tap, answers honestly labeled, and practice that respects exam timing.
          </p>
        </div>

      <motion.div
        className="relative mx-auto mt-8 grid max-w-4xl gap-8 md:grid-cols-[1fr_auto_1fr] md:items-start md:gap-4 lg:mt-10 lg:gap-7"
        {...enter}
      >
        <div className="flex flex-col gap-4">
          <StepLabel
            step={1}
            variant="before"
            title="Before: stuck in a PDF"
            subtitle="One scan among many—hard to search, flag, or practise under time."
          />
        {/* Browser-style PDF viewer mock — scan + stacked pages */}
        <div className="relative flex min-h-[14rem] flex-col overflow-hidden rounded-2xl border-2 border-red-400/35 bg-gradient-to-b from-neutral-200/90 to-neutral-300/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)] ring-1 ring-red-500/15 dark:from-neutral-800 dark:to-neutral-950 dark:ring-red-500/20">
          {/* Viewer chrome */}
          <div className="flex items-center gap-2 border-b border-neutral-400/25 bg-neutral-300/60 px-2 py-1.5 dark:border-neutral-600 dark:bg-neutral-800/95">
            <div className="flex shrink-0 items-center gap-1 pl-0.5" aria-hidden>
              <span className="h-2 w-2 rounded-full bg-[#ff5f57]/90 shadow-sm ring-1 ring-black/10 dark:ring-white/10" />
              <span className="h-2 w-2 rounded-full bg-[#febc2e]/90 shadow-sm ring-1 ring-black/10 dark:ring-white/10" />
              <span className="h-2 w-2 rounded-full bg-[#28c840]/90 shadow-sm ring-1 ring-black/10 dark:ring-white/10" />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-white/95 px-2 py-1 shadow-sm ring-1 ring-black/[0.04] dark:bg-neutral-900/95 dark:ring-white/10">
              <FileText className="h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" strokeWidth={2} aria-hidden />
              <span className="truncate font-mono text-[10px] font-medium text-text-secondary">
                FIN201_midterm_2019_scan.pdf
              </span>
            </div>
            <div
              className="flex shrink-0 items-center gap-1 text-neutral-600 dark:text-neutral-400"
              aria-hidden
            >
              <span className="rounded p-0.5">
                <Minus className="h-3 w-3" strokeWidth={2} />
              </span>
              <span className="min-w-[2rem] text-center font-mono text-[9px] font-semibold tabular-nums">
                72%
              </span>
              <span className="rounded p-0.5">
                <Plus className="h-3 w-3" strokeWidth={2} />
              </span>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded border border-neutral-400/40 bg-white/80 px-1.5 py-0.5 font-mono text-[9px] font-semibold tabular-nums text-text-muted shadow-sm dark:border-neutral-600 dark:bg-neutral-900/80">
              <span className="text-red-600 dark:text-red-400">3</span>
              <span>/</span>
              <span>14</span>
            </span>
          </div>

          {/* Document canvas */}
          <div className="relative flex flex-1 flex-col bg-[#e8e4dc] px-2 pb-2 pt-2 dark:bg-[#141211]">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-2 px-1">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-500">
                WhatsApp attachment · not searchable
              </p>
              <p className="hidden truncate font-mono text-[8px] text-neutral-400 dark:text-neutral-600 sm:block">
                ~/Downloads/FIN201_midterm_2019_scan.pdf
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-[17.5rem] flex-1 pb-1">
              {/* Sheets behind — “pile of PDFs” */}
              {!reduceMotion ? (
                <>
                  <div
                    className="pointer-events-none absolute left-1 right-3 top-4 z-0 h-[92%] rounded-[2px] bg-[#dcd8cf] shadow-[1px_2px_0_rgba(15,23,42,0.07)] ring-1 ring-black/[0.06] dark:bg-[#1a1816] dark:ring-white/[0.06]"
                    style={{ transform: 'rotate(2.5deg) translateY(4px)' }}
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute left-2 right-2 top-2 z-[1] h-[94%] rounded-[2px] bg-[#ece8e2] shadow-[1px_2px_0_rgba(15,23,42,0.06)] ring-1 ring-black/[0.06] dark:bg-[#1f1c1a] dark:ring-white/[0.07]"
                    style={{ transform: 'rotate(-1.8deg)' }}
                    aria-hidden
                  />
                </>
              ) : null}
            {/* Paper page */}
            <div
              className={`relative z-[2] mx-auto w-full rounded-[2px] bg-[#faf9f6] shadow-[2px_3px_0_rgba(15,23,42,0.06),0_14px_32px_-10px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.07] dark:bg-[#252322] dark:shadow-[2px_3px_0_rgba(0,0,0,0.45)] dark:ring-white/[0.08] ${reduceMotion ? '' : '-rotate-[1deg]'}`}
            >
              {/* Scan noise */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-multiply dark:opacity-[0.09] dark:mix-blend-soft-light"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
                aria-hidden
              />
              {/* Crooked highlight band (bad scan) */}
              <div
                className="pointer-events-none absolute left-[8%] top-[38%] h-[28%] w-[84%] rounded-sm bg-amber-200/25 dark:bg-amber-400/10"
                aria-hidden
              />

              <div className="relative border-b border-neutral-200/90 px-3 py-2 dark:border-neutral-600/80">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-[Georgia,'Times_New_Roman',serif] text-[9px] font-bold leading-tight text-neutral-800 dark:text-neutral-100">
                      UNIVERSITY OF GHANA
                    </p>
                    <p className="mt-0.5 font-[Georgia,'Times_New_Roman',serif] text-[8px] font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
                      B.Sc. (Economics) · FIN 201 · April 2019
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-0.5 rounded bg-red-500/12 px-1 py-0.5 text-[8px] font-bold uppercase text-red-700 dark:bg-red-500/20 dark:text-red-300">
                    <FileWarning className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
                    Scan
                  </span>
                </div>
              </div>

              <div className="relative px-3 pb-2 pt-2 pl-7">
                <div
                  className="absolute bottom-3 left-2 top-2 w-px bg-red-400/35 dark:bg-red-500/30"
                  aria-hidden
                />
                <div
                  className="absolute bottom-3 left-[11px] top-2 w-px bg-red-400/20 dark:bg-red-500/18"
                  aria-hidden
                />
                <p className="text-center font-[Georgia,'Times_New_Roman',serif] text-[9px] font-bold tracking-wide text-neutral-700 dark:text-neutral-300">
                  SECTION A — MULTIPLE CHOICE
                </p>
                <p className="mt-2 text-[8.5px] leading-[1.55] text-neutral-700/90 dark:text-neutral-300/95">
                  <span className="font-bold">2.</span> When the price elasticity of demand is greater than 1
                  (elastic), a decrease in the price of the good will most likely lead to…
                </p>
                {/* Faded option rows — buried in the scan */}
                <div className="mt-2.5 space-y-1" aria-hidden>
                  {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                    <div
                      key={letter}
                      className="flex items-center gap-2 opacity-[0.38]"
                    >
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-neutral-400/70 text-[7px] font-bold text-neutral-500 dark:border-neutral-500 dark:text-neutral-400">
                        {letter}
                      </span>
                      <span className="h-[3px] flex-1 rounded-[1px] bg-neutral-400/75 dark:bg-neutral-500" />
                    </div>
                  ))}
                </div>
                {/* Illegible tail — typical of scans */}
                <div className="mt-2 space-y-1 opacity-[0.35]" aria-hidden>
                  <span className="block h-[3px] w-[94%] rounded-[1px] bg-neutral-400/90 dark:bg-neutral-500" />
                  <span className="block h-[3px] w-[88%] rounded-[1px] bg-neutral-400/80 dark:bg-neutral-500" />
                  <span className="block h-[3px] w-[76%] rounded-[1px] bg-neutral-400/70 dark:bg-neutral-500" />
                </div>
                <p className="mt-2.5 text-center font-mono text-[8px] tabular-nums tracking-wide text-neutral-400 dark:text-neutral-500">
                  — 3 —
                </p>
              </div>
            </div>
            </div>
          </div>

          <p className="border-t border-red-500/15 bg-red-500/[0.06] px-3 py-2.5 text-xs font-medium leading-snug text-text-secondary dark:border-red-500/20 dark:bg-red-950/30 sm:px-4">
            <span className="font-semibold text-text-primary">The problem:</span> same exam paper, but
            trapped in a viewer—slow to search and impossible to run like a real sitting.
          </p>
        </div>
        </div>

        {/* Step 2 — connector (arrow first on mobile for scan-to-app flow) */}
        <div className="flex flex-col items-center justify-center gap-4 md:max-w-[13rem] md:gap-5">
          <StepLabel
            step={2}
            variant="middle"
            title="We structure it"
            subtitle="Question stem and A–D choices are extracted from the scan—no more squinting at bars."
          />
          <div className="flex flex-col items-center gap-2">
            <span className="relative order-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-teal-500/40 bg-gradient-to-br from-teal-500/[0.18] to-cyan-500/[0.08] text-teal-900 shadow-[0_6px_28px_-8px_rgba(13,148,136,0.5)] md:order-2 dark:border-teal-400/35 dark:from-teal-500/25 dark:to-cyan-500/12 dark:text-teal-50 dark:shadow-[0_8px_32px_-10px_rgba(45,212,191,0.35)]">
              {!reduceMotion ? (
                <span
                  className="pointer-events-none absolute inset-0 rounded-full bg-teal-400/20 blur-md dark:bg-teal-400/12"
                  aria-hidden
                />
              ) : null}
              <ArrowDown className="relative h-6 w-6 md:hidden" aria-hidden />
              <ArrowRight className="relative hidden h-6 w-6 md:block" aria-hidden />
            </span>
            <span className="order-2 max-w-[17rem] text-center text-xs font-bold uppercase tracking-[0.14em] text-teal-900 dark:text-teal-100 md:order-1 md:text-[11px] md:leading-snug md:tracking-[0.2em] md:text-teal-800 md:dark:text-teal-200">
              Extract &amp; practise
            </span>
          </div>
          <p className="max-w-[20rem] text-center text-sm leading-relaxed text-text-secondary md:hidden">
            That scan becomes a real MCQ in {brand}—tap options, start a timer, and track how you
            improve.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <StepLabel
            step={3}
            variant="after"
            title={`After: practise in ${brand}`}
            subtitle="Tap an answer, see labels, run timed sets, watch weak topics surface."
          />
        {/* Structured question in-app */}
        <div className="relative flex min-h-[14rem] flex-col overflow-hidden rounded-2xl border-2 border-teal-500/35 bg-bg-surface shadow-[0_24px_60px_-32px_rgba(15,118,110,0.32),inset_0_1px_0_0_rgba(255,255,255,0.07)] ring-1 ring-teal-500/15 dark:border-teal-400/35 dark:shadow-[0_28px_75px_-36px_rgba(0,0,0,0.55)] dark:ring-teal-400/10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-teal-500/[0.07] to-transparent dark:from-teal-400/[0.06]" aria-hidden />
          <div className="relative flex flex-1 flex-col p-4">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[var(--border-default)] pb-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-teal-800 dark:text-teal-300">
                {brand} · extracted question
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-text-muted">
                FIN 201 · Microeconomics · Q2
              </p>
            </div>
            <span className="rounded-full border border-teal-500/30 bg-teal-500/[0.08] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-200">
              Timed
            </span>
          </div>
          <p className="mt-3 font-[Outfit,system-ui,sans-serif] text-[13px] font-semibold leading-snug text-text-primary sm:text-sm">
            {DEMO_STEM}
          </p>
          <ul className="mt-3 space-y-1.5" aria-hidden>
            {(['Reduce revenue.', 'Increase revenue.', 'Leave revenue unchanged.', 'Need supply data.'] as const).map(
              (label, i) => (
                <li
                  key={label}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium leading-tight ${
                    i === 1
                      ? 'border-teal-500/45 bg-teal-500/[0.1] text-text-primary'
                      : 'border-[var(--border-default)] text-text-secondary'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                      i === 1
                        ? 'bg-teal-600 text-white dark:bg-teal-500'
                        : 'border border-[var(--border-default)] bg-bg-raised text-text-muted'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="min-w-0">{label}</span>
                </li>
              ),
            )}
          </ul>
          <div className="mt-auto border-t border-teal-500/20 bg-teal-500/[0.06] px-3 py-2.5 dark:border-teal-500/25 dark:bg-teal-950/35 sm:px-4">
            <p className="text-xs font-medium leading-snug text-text-secondary">
              <span className="font-semibold text-teal-900 dark:text-teal-200">The payoff:</span>{' '}
              searchable bank, every answer labeled (official · community · AI), and stats that show
              where you still lose marks.
            </p>
          </div>
          </div>
        </div>
        </div>
      </motion.div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-sm font-semibold text-text-primary sm:text-base">
        What you unlock once it&apos;s in {brand}
      </p>
      <motion.ul
        className="mx-auto mt-4 flex max-w-4xl flex-col gap-3 sm:mt-5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      >
        {benefitPills.map(({ icon: Icon, label, hint }) => (
          <li
            key={label}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-teal-500/20 bg-teal-500/[0.07] px-3 py-3 shadow-sm dark:border-teal-500/30 dark:bg-teal-950/35 sm:min-w-[13rem] sm:flex-initial sm:max-w-[14rem]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/20">
              <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-text-primary">{label}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-text-muted">{hint}</span>
            </span>
          </li>
        ))}
      </motion.ul>

        <div className="mt-8 flex flex-col items-center gap-3 border-t border-[var(--border-default)] pt-8 sm:mt-10 sm:gap-4">
          <p className="text-center text-sm text-text-secondary">
            Stop revision nights lost inside unnamed PDFs — put the next paper where your cohort can
            actually practise.
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_36px_rgba(234,88,12,0.26)] transition hover:brightness-105 active:scale-[0.99] dark:from-orange-500 dark:to-amber-500"
          >
            Create a free account
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
