'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';

export type TestimonialItem = {
  quote: string;
  /** Muted footer line (audience or attribution). */
  footer: string;
};

export type TestimonialCarouselProps = {
  items: TestimonialItem[];
  autoplay?: boolean;
  /** Interval when autoplay is on (respects reduced motion). */
  autoplayMs?: number;
  className?: string;
};

/**
 * Text-focused testimonial carousel (minimal card: teal left accent, quote mark, nav arrows).
 * Inspired by animated testimonials patterns; portraits optional — pass items without images only.
 */
export function TestimonialCarousel({
  items,
  autoplay = true,
  autoplayMs = 6500,
  className = '',
}: TestimonialCarouselProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const labelId = useId();

  const len = items.length;
  const safeLen = Math.max(len, 1);

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % safeLen);
  }, [safeLen]);

  const handlePrev = useCallback(() => {
    setActive((prev) => (prev - 1 + safeLen) % safeLen);
  }, [safeLen]);

  useEffect(() => {
    if (!autoplay || reduceMotion || len <= 1) return;
    const interval = window.setInterval(handleNext, autoplayMs);
    return () => window.clearInterval(interval);
  }, [autoplay, autoplayMs, handleNext, len, reduceMotion]);

  if (len === 0) {
    return null;
  }

  const current = items[active]!;

  const contentMotion = reduceMotion
    ? {
        initial: false,
        animate: { opacity: 1, y: 0 },
      }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <div className={`mx-auto w-full max-w-3xl px-1 ${className}`.trim()}>
      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-bg-surface shadow-[var(--shadow-card)] dark:bg-bg-surface/95"
        role="region"
        aria-labelledby={labelId}
        aria-roledescription="carousel"
      >
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-teal-500 via-cyan-500 to-teal-600"
          aria-hidden
        />
        <div className="relative px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <p id={labelId} className="sr-only">
            Testimonials
          </p>
          <Quote
            className="h-9 w-9 text-teal-500/45 sm:h-10 sm:w-10"
            strokeWidth={1.35}
            aria-hidden
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              {...contentMotion}
              className="mt-5"
              aria-live={reduceMotion ? 'off' : 'polite'}
            >
              <blockquote className="text-pretty font-[Outfit,system-ui,sans-serif] text-xl font-semibold leading-snug tracking-tight text-text-primary sm:text-2xl sm:leading-snug">
                <p>&ldquo;{current.quote}&rdquo;</p>
              </blockquote>
              <p className="mt-8 border-t border-teal-500/15 pt-6 text-sm font-medium leading-relaxed text-text-secondary">
                {current.footer}
              </p>
            </motion.div>
          </AnimatePresence>

          <p className="sr-only">
            Slide {active + 1} of {len}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-default)] bg-bg-raised/80 text-text-primary shadow-sm transition hover:bg-bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] dark:bg-bg-raised/40 dark:hover:bg-bg-raised/70"
              >
                <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next testimonial"
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-default)] bg-bg-raised/80 text-text-primary shadow-sm transition hover:bg-bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] dark:bg-bg-raised/40 dark:hover:bg-bg-raised/70"
              >
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
              </button>
            </div>
            <div className="flex flex-1 justify-center gap-1.5 sm:justify-end">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === active}
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-[width,background] duration-300 ${
                    i === active
                      ? 'w-7 bg-teal-600 dark:bg-teal-400'
                      : 'w-2 bg-[var(--border-default)] hover:bg-text-muted/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
