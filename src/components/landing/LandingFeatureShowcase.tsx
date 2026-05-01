'use client';

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  BookMarked,
  CheckCircle2,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { getMarketingBrandName } from '@/lib/landing-brand';
import { FeatureSection } from '@/components/landing/FeatureSection';
import { QuizShowcase } from '@/components/landing/QuizShowcase';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';

const BRAND = getMarketingBrandName();

const previewPillClass =
  'rounded-full border border-[var(--border-default)] bg-bg-surface/90 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-text-muted shadow-sm backdrop-blur-sm';

/** Flat layout — no stacked parallax cards (avoids “tilted” 3D feel). */
function AIExplainShowcase() {
  const reduceMotion = useReducedMotion();
  const steps = [
    'Meiosis halves chromosome number when forming gametes — that’s the distinction examiners love.',
    'Mitosis keeps the full set for growth and repair in somatic cells.',
    'So: if the question asks what reduces n → look for meiosis first.',
  ];

  return (
    <div className="relative mx-auto flex w-full max-w-xl justify-center lg:max-w-none lg:justify-start">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-12%' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border bg-gradient-to-br from-[var(--bg-surface)] to-teal-50/50 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)] dark:from-[var(--bg-surface)] dark:to-[var(--bg-surface)] dark:shadow-[0_28px_90px_-30px_rgba(0,0,0,0.55)]"
        style={{
          borderColor: 'var(--border-default)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.55] dark:opacity-[0.35]"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 10% 0%, rgba(45,212,191,0.14), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 100%, rgba(14,165,233,0.1), transparent 50%)',
          }}
          aria-hidden
        />

        <div className="relative p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{
                borderColor: 'rgba(15,118,110,0.35)',
                background: 'rgba(15,118,110,0.08)',
                color: 'var(--landing-feature-eyebrow)',
              }}
            >
              <Sparkles className="h-3.5 w-3.5 opacity-90" strokeWidth={2.5} aria-hidden />
              After you answer
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              AI breakdown
            </span>
          </div>

          <p
            className="font-[Outfit,system-ui,sans-serif] text-base font-semibold leading-snug text-text-primary sm:text-lg"
          >
            &ldquo;Which process reduces chromosome number before fertilisation?&rdquo;
          </p>
          <p className="mt-2 text-xs font-medium text-text-secondary sm:text-sm">
            Multiple choice · Cell biology · Past-paper style
          </p>

          <motion.div
            className="mt-6 rounded-2xl border border-teal-700/15 bg-teal-50/70 p-4 sm:p-5 dark:border-teal-500/25 dark:bg-teal-950/35"
            style={{
              boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
            }}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.45 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/25 dark:bg-teal-500">
                <Brain className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                  Exam-ready reasoning
                </p>
                <p className="text-xs font-medium text-text-muted">More than picking A or B—the reasoning examiners look for</p>
              </div>
            </div>
            <ul className="space-y-3">
              {steps.map((line, i) => (
                <motion.li
                  key={i}
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: reduceMotion ? 0 : 0.06 * i + 0.12, duration: 0.4 }}
                  className="flex gap-3 text-sm leading-relaxed text-text-secondary"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span>{line}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-lg border border-[var(--border-default)] bg-bg-raised/80 px-3 py-1.5 text-[11px] font-semibold text-text-secondary">
              Linked to your syllabus topics
            </span>
            <span className="rounded-lg border border-teal-500/25 bg-teal-500/[0.07] px-3 py-1.5 text-[11px] font-semibold text-teal-800 dark:text-teal-300">
              Same rigour as hall exams
            </span>
          </div>
          <div className="mt-6">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 underline-offset-4 transition hover:text-teal-900 hover:underline dark:text-teal-300 dark:hover:text-teal-100"
            >
              Register to get AI explanations on your papers
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const RADAR_TOPICS = [
  {
    label: 'Organic mechanisms',
    pct: 34,
    hint: 'Highest leak risk — tackle mechanisms before the final.',
    tone: 'weak' as const,
  },
  {
    label: 'Integration techniques',
    pct: 61,
    hint: 'Solid base—more timed reps lock it in.',
    tone: 'mid' as const,
  },
  {
    label: 'Data structures',
    pct: 89,
    hint: 'Comfort zone—maintain with mixed papers.',
    tone: 'strong' as const,
  },
  {
    label: 'Thermodynamics',
    pct: 52,
    hint: 'Mid-sem gap—review cycles & units.',
    tone: 'mid' as const,
  },
];

function topicRowAccent(tone: 'strong' | 'mid' | 'weak') {
  if (tone === 'weak')
    return {
      bar: 'from-rose-500 via-orange-400 to-amber-400',
      edge: 'border-l-rose-500',
      soft: 'bg-gradient-to-br from-rose-500/[0.07] to-transparent dark:from-rose-950/25',
      badge: 'bg-rose-500/15 text-rose-800 dark:text-rose-200',
      Icon: AlertTriangle,
    };
  if (tone === 'strong')
    return {
      bar: 'from-teal-500 to-emerald-400',
      edge: 'border-l-teal-500',
      soft: 'bg-gradient-to-br from-teal-500/[0.06] to-transparent dark:from-teal-950/30',
      badge: 'bg-teal-500/12 text-teal-900 dark:text-teal-200',
      Icon: Sparkles,
    };
  return {
    bar: 'from-amber-400 to-teal-500',
    edge: 'border-l-amber-500',
    soft: 'bg-gradient-to-br from-amber-500/[0.06] to-transparent dark:from-amber-950/20',
    badge: 'bg-amber-500/12 text-amber-900 dark:text-amber-200',
    Icon: TrendingUp,
  };
}

function TopicStrengthRow({
  pct,
  label,
  hint,
  tone,
  index,
}: {
  pct: number;
  label: string;
  hint: string;
  tone: 'strong' | 'mid' | 'weak';
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  const { bar, edge, soft, badge, Icon } = topicRowAccent(tone);
  const status =
    tone === 'weak' ? 'Priority' : tone === 'strong' ? 'Strong' : 'Building';

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ delay: reduceMotion ? 0 : 0.06 * index, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-2xl border border-[var(--border-default)] ${edge} border-l-[4px] shadow-sm ${soft}`}
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-text-muted opacity-80" aria-hidden />
            <span className="font-[Outfit,system-ui,sans-serif] text-sm font-semibold leading-snug text-text-primary sm:text-[0.9375rem]">
              {label}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge}`}
            >
              {status}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{hint}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:w-[min(100%,220px)]">
          <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--bg-raised)] ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${bar}`}
              initial={reduceMotion ? { width: `${pct}%` } : { width: '0%' }}
              whileInView={{ width: `${pct}%` }}
              viewport={{ once: true }}
              transition={{
                duration: 1,
                delay: reduceMotion ? 0 : 0.1 + index * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </div>
          <span className="w-11 text-right font-[Outfit,system-ui,sans-serif] text-base font-bold tabular-nums text-text-primary sm:w-12">
            {pct}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/** Single-surface radar — no floating second card, no parallax skew. */
function RevisionRadarShowcase() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-3xl border shadow-[0_20px_70px_-20px_rgba(15,23,42,0.15)] dark:shadow-[0_24px_80px_-24px_rgba(0,0,0,0.5)]"
        style={{
          borderColor: 'var(--border-default)',
          background: 'var(--bg-surface)',
        }}
      >
        <div
          className="border-b px-5 py-4 sm:px-6"
          style={{
            borderColor: 'var(--border-default)',
            background: 'color-mix(in srgb, var(--bg-raised) 88%, transparent)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-600/20">
                <Target className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                  Revision radar
                </p>
                <p className="font-[Outfit,system-ui,sans-serif] text-base font-semibold text-text-primary sm:text-lg">
                  Where you actually leak marks
                </p>
              </div>
            </div>
            <div
              className="rounded-full border px-3 py-1.5 text-left text-[11px] font-semibold"
              style={{
                borderColor: 'rgba(15,118,110,0.3)',
                background: 'rgba(15,118,110,0.07)',
                color: 'var(--landing-feature-eyebrow)',
              }}
            >
              Updates every attempt
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 sm:gap-3.5 sm:p-6">
          {RADAR_TOPICS.map((t, i) => (
            <TopicStrengthRow key={t.label} {...t} index={i} />
          ))}
        </div>

        <div
          className="flex flex-col gap-3 border-t px-5 py-4 sm:px-6"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <div className="flex items-start gap-3">
            <BookMarked className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" strokeWidth={2} aria-hidden />
            <p className="text-left text-sm font-medium leading-relaxed text-text-secondary">
              Each quiz updates this map—so you study topics where you lose points, not only what people mention in chat.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-teal-800 underline-offset-4 transition hover:underline dark:text-teal-300"
          >
            Register to track your readiness
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export function LandingFeatureShowcase() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start center'],
  });
  const orbOpacity = useTransform(scrollYProgress, [0, 0.45], [0.55, 1]);
  const glowY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [40, -30]);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="landing-features-showcase relative scroll-mt-24 border-t border-[var(--border-default)] bg-bg-base"
      aria-labelledby="features-tour-heading"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(520px,55vh)] overflow-hidden" aria-hidden>
        <motion.div
          style={{ opacity: orbOpacity, y: glowY }}
          className="absolute left-1/2 top-[-20%] h-[420px] w-[min(900px,120%)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(15,118,110,0.12),transparent_68%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.1),transparent_70%)]"
        />
        <div className="absolute right-[8%] top-[30%] h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.08),transparent_70%)] opacity-90 dark:opacity-100" />
      </div>

      <div className="relative isolate mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl scroll-mt-28 pb-8 pt-14 text-center sm:pb-10 sm:pt-16 lg:pt-20"
        >
          <motion.p
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{
              borderColor: 'var(--border-default)',
              background: 'var(--bg-surface)',
              color: 'var(--landing-feature-eyebrow)',
            }}
            initial={reduceMotion ? false : { scale: 0.96, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            Built for exam week
          </motion.p>
          <h2
            id="features-tour-heading"
            className="mt-5 text-balance font-[Outfit,system-ui,sans-serif] text-3xl font-semibold leading-[1.12] tracking-tight text-text-primary sm:text-4xl lg:text-[2.65rem] lg:leading-[1.08]"
          >
            Three reasons students{' '}
            <span className="bg-gradient-to-r from-teal-700 via-cyan-600 to-teal-600 bg-clip-text text-transparent dark:from-teal-300 dark:via-cyan-300 dark:to-emerald-300">
              switch to {BRAND}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base font-medium leading-relaxed text-text-secondary sm:text-lg">
            Practice under exam-like conditions. Get explanations you can follow. See which topics still need work—before
            you sit the paper.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--brand-orange)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-float)] transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Register free — start practising
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </motion.div>

        <div className="flex flex-col gap-6 lg:gap-8">
          <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            className="landing-feature-row scroll-mt-28 rounded-[2rem] border border-[var(--border-default)] bg-bg-surface/85 p-5 shadow-[var(--shadow-card)] backdrop-blur-sm dark:bg-bg-surface/25 dark:shadow-none sm:p-7 lg:p-9"
          >
            <FeatureSection
              step={1}
              staticVisual
              eyebrow="Hall-realistic exams"
              headline={['Past papers.', 'Same pressure.', 'Instant marks.']}
              accentLine="Same pressure."
              body={`Timed runs, navigation, flags, and scoring—papers from schools across Ghana in one place. No digging through DMs or PDF folders before ${BRAND}.`}
              ctaLabel="Start free — try a quiz"
              ctaHref="/register"
            >
              <ContainerScroll
                flatMotion
                scrollTrackClassName="min-h-[86vh] sm:min-h-[92vh]"
                title={<span className={previewPillClass}>Live exam preview</span>}
              >
                <QuizShowcase />
              </ContainerScroll>
            </FeatureSection>
          </motion.article>

          <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ duration: 0.62, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="landing-feature-row scroll-mt-28 rounded-[2rem] border border-[var(--border-default)] bg-bg-surface/85 p-5 shadow-[var(--shadow-card)] backdrop-blur-sm dark:bg-bg-surface/25 dark:shadow-none sm:p-7 lg:p-9"
          >
            <FeatureSection
              step={2}
              staticVisual
              eyebrow="AI explanations"
              headline={['Wrong answer?', 'Get the why—not just the key.']}
              accentLine="Get the why—not just the key."
              body="Step-by-step reasoning that matches how exam questions are framed—so the next similar question does not surprise you."
              ctaLabel="See how explanations work"
              ctaHref="/register"
              flip
            >
              <ContainerScroll
                align="start"
                scrollTrackClassName="min-h-[74vh] sm:min-h-[80vh]"
                title={<span className={previewPillClass}>AI breakdown preview</span>}
              >
                <AIExplainShowcase />
              </ContainerScroll>
            </FeatureSection>
          </motion.article>

          <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ duration: 0.62, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="landing-feature-row scroll-mt-28 rounded-[2rem] border border-[var(--border-default)] bg-bg-surface/85 p-5 shadow-[var(--shadow-card)] backdrop-blur-sm dark:bg-bg-surface/25 dark:shadow-none sm:p-7 lg:p-9"
          >
            <FeatureSection
              step={3}
              staticVisual
              eyebrow="Revision radar"
              headline={['Weak topics surface fast.', 'Revision follows the marks.']}
              accentLine="Revision follows the marks."
              body="Every attempt updates topic strength—use your study time on chapters that cost marks, not only what the group chat is shouting about."
              ctaLabel="Preview your readiness map"
              ctaHref="/register"
            >
              <ContainerScroll
                scrollTrackClassName="min-h-[68vh] sm:min-h-[74vh]"
                title={<span className={previewPillClass}>Readiness snapshot</span>}
              >
                <RevisionRadarShowcase />
              </ContainerScroll>
            </FeatureSection>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
