'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FeatureSectionProps {
  eyebrow: string;
  headline: string[];
  accentLine: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  flip?: boolean;
  /** Step index for numbered showcase (1–3). */
  step?: number;
  /**
   * Skip transform-based entrance on the visual column so children can use
   * `position: sticky` (e.g. scroll-scaled previews).
   */
  staticVisual?: boolean;
  children: ReactNode;
}

export function FeatureSection({
  eyebrow,
  headline,
  accentLine,
  body,
  ctaLabel,
  ctaHref,
  flip = false,
  step,
  staticVisual = false,
  children,
}: FeatureSectionProps) {
  const reduceMotion = useReducedMotion();
  const spotlightOnRight = !flip;

  const copyVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.09,
        delayChildren: reduceMotion ? 0 : 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: reduceMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div className="relative py-9 sm:py-11 lg:py-14">
      {/* Cool spotlight behind visual column — slate / sky / teal (theme tokens) */}
      <div
        className={`pointer-events-none absolute top-3 z-0 hidden h-[min(62vh,560px)] max-h-[620px] rounded-[2rem] opacity-[0.98] shadow-[inset_0_0_0_1px_var(--landing-showcase-panel-edge)] lg:block lg:w-[min(48%,580px)] ${
          spotlightOnRight ? 'right-0 rounded-r-[2rem] rounded-l-none' : 'left-0 rounded-l-[2rem] rounded-r-none'
        }`}
        style={{ background: 'var(--landing-showcase-panel)' }}
        aria-hidden
      />

      <div
        className={`relative z-10 flex flex-col items-stretch gap-8 lg:gap-10 xl:gap-12 ${
          flip ? 'lg:flex-row-reverse' : 'lg:flex-row'
        } lg:items-start`}
      >
        <motion.div
          className="min-w-0 flex-1 lg:max-w-[min(100%,30rem)] xl:max-w-lg"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={copyVariants}
        >
          <motion.div variants={itemVariants} className="mb-3 flex items-center gap-3">
            {step != null ? (
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-[Outfit,system-ui,sans-serif] text-sm font-bold tabular-nums"
                style={{
                  background: 'var(--brand-orange-dim)',
                  color: 'var(--brand-orange)',
                  border: '1px solid rgba(249,115,22,0.25)',
                }}
              >
                {String(step).padStart(2, '0')}
              </span>
            ) : null}
            <p
              className="text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: 'var(--landing-feature-eyebrow)' }}
            >
              {eyebrow}
            </p>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="mb-4 text-balance font-semibold leading-[1.06] tracking-tight"
            style={{
              fontSize: 'clamp(1.85rem, 4.8vw, 2.85rem)',
              color: 'var(--text-primary)',
              fontFamily: 'Outfit, system-ui, sans-serif',
            }}
          >
            {headline.map((line, i) => (
              <span key={i}>
                <span
                  style={{
                    color: line === accentLine ? 'var(--brand-orange)' : 'inherit',
                  }}
                >
                  {line}
                </span>
                {i < headline.length - 1 && <br />}
              </span>
            ))}
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mb-6 max-w-lg text-base font-medium leading-relaxed sm:text-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            {body}
          </motion.p>

          <motion.div variants={itemVariants}>
            <Link
              href={ctaHref}
              className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-[var(--shadow-float)] transition-[transform,box-shadow] duration-200 will-change-transform hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] sm:text-base"
              style={{
                background: 'var(--brand-orange)',
                color: '#fff',
              }}
            >
              {ctaLabel}
              <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
                →
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {staticVisual ? (
          <motion.div
            className="relative w-full min-w-0 flex-1 lg:max-w-[min(100%,42rem)] xl:max-w-[44rem]"
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative overflow-visible rounded-xl p-1 sm:p-2">
              {children}
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="relative min-h-[min(400px,70vw)] w-full min-w-0 flex-1 lg:min-h-[min(520px,62vh)]"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative h-full min-h-[inherit] overflow-visible rounded-xl p-1 sm:p-2">
              {children}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
