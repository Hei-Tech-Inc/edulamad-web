'use client';

import { useRouter } from 'next/router';
import { motion, useReducedMotion } from 'framer-motion';
import { CircleDollarSign, ShieldCheck, Sparkles } from 'lucide-react';
import { PricingCards } from '@/components/pricing/PricingCards';
import type { BillingPeriod } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Homepage pricing embed. Resets inherited `text-neutral-100` from the landing shell
 * and uses a full-width card stack (no narrow 8-column grid) so toggles + 3 plans fit.
 */
export function LandingPricingSection() {
  const router = useRouter();
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();

  const onSelectPlan = (planId: string, billing: BillingPeriod) => {
    if (planId === 'free') {
      void router.push('/register');
      return;
    }
    if (user) {
      const q = new URLSearchParams();
      q.set('plan', planId);
      q.set('billing', billing);
      void router.push(`/profile/subscription?${q.toString()}`);
      return;
    }
    const next = `/profile/subscription?plan=${encodeURIComponent(planId)}&billing=${encodeURIComponent(billing)}`;
    void router.push(`/login?next=${encodeURIComponent(next)}`);
  };

  const motionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-60px' },
        transition: {
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      };

  return (
    <section
      id="pricing"
      className="relative scroll-mt-28 overflow-hidden border-t border-[var(--border-default)] bg-bg-base py-16 text-text-primary sm:py-20 lg:py-24"
      aria-labelledby="pricing-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_50%_0%,rgba(45,212,191,0.09),transparent_58%)] dark:opacity-95"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...motionProps}>
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-left">
            <div
              className={cn(
                'mb-4 inline-flex items-center gap-2 rounded-full border border-teal-600/20 bg-teal-500/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                'text-teal-800 dark:border-teal-500/25 dark:bg-teal-500/10 dark:text-teal-300',
              )}
            >
              <CircleDollarSign
                className={cn('h-4 w-4', 'text-teal-600 dark:text-teal-400')}
                strokeWidth={2}
                aria-hidden
              />
              Plans
            </div>
            <h2
              id="pricing-heading"
              className={cn(
                'font-[Outfit,system-ui,sans-serif] text-3xl font-bold leading-tight tracking-tight sm:text-4xl',
                'text-text-primary',
              )}
            >
              Simple pricing for serious prep
            </h2>
            <p
              className={cn(
                'mt-3 text-pretty text-base leading-relaxed sm:text-[1.05rem]',
                'text-text-secondary',
              )}
            >
              Start free, upgrade when you are ready. Semester billing saves versus
              four monthly renewals — same plans as our full pricing page.
            </p>
            <p
              className={cn(
                'mt-4 inline-flex rounded-full border border-orange-500/25 bg-orange-500/[0.06] px-3 py-1 text-xs font-semibold',
                'text-orange-900 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200',
              )}
            >
              Pro is highlighted — full AI tutor, exam tools, and depth most cohorts need.
            </p>
            <ul
              className={cn(
                'mt-8 flex flex-col gap-3 text-left text-sm sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 lg:justify-start',
                'text-text-secondary',
              )}
            >
              <li className="flex items-start gap-2.5">
                <ShieldCheck
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0',
                    'text-emerald-400',
                  )}
                  strokeWidth={2}
                  aria-hidden
                />
                <span>Mobile money &amp; cards via Paystack</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Sparkles
                  className={cn('mt-0.5 h-4 w-4 shrink-0', 'text-teal-600 dark:text-teal-400')}
                  strokeWidth={2}
                  aria-hidden
                />
                <span>Pro unlocks full AI tutor + exam tools</span>
              </li>
            </ul>
          </div>

          <div
            className={cn(
              'relative mt-10 overflow-hidden rounded-3xl border border-teal-500/15 bg-gradient-to-b from-bg-surface/95 to-bg-base/40 p-4 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.12)] backdrop-blur-md dark:from-bg-surface/75 dark:to-bg-base/60 dark:shadow-[0_28px_90px_-40px_rgba(0,0,0,0.5)]',
              'sm:p-6 lg:p-8',
            )}
          >
            <div
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/35 to-transparent sm:inset-x-10"
              aria-hidden
            />
            {/* Isolate color/stacking so plan cards never inherit landing shell text */}
            <div
              className="isolate pt-1 text-text-primary"
            >
              <PricingCards
                currentPlanId="free"
                highlightPlanId="pro"
                onSelectPlan={onSelectPlan}
                context="page"
                showComparisonAndFaq={false}
                compactToggle
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
