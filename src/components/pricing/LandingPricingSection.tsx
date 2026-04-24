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
      className="scroll-mt-24 border-t border-white/[0.08] bg-[#070a12] py-16 text-slate-50 sm:py-20 lg:py-24"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...motionProps}>
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-left">
            <div
              className={cn(
                'mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]',
                'text-orange-400',
              )}
            >
              <CircleDollarSign
                className={cn(
                  'h-4 w-4',
                  'text-orange-400',
                )}
                strokeWidth={2}
                aria-hidden
              />
              Plans
            </div>
            <h2
              id="pricing-heading"
              className={cn(
                'font-[Outfit,system-ui,sans-serif] text-3xl font-bold leading-tight tracking-tight sm:text-4xl',
                'text-white',
              )}
            >
              Simple pricing for serious prep
            </h2>
            <p
              className={cn(
                'mt-3 text-pretty text-base leading-relaxed sm:text-[1.05rem]',
                'text-slate-300',
              )}
            >
              Start free, upgrade when you are ready. Semester billing saves versus
              four monthly renewals — same plans as our full pricing page.
            </p>
            <ul
              className={cn(
                'mt-8 flex flex-col gap-3 text-left text-sm sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 lg:justify-start',
                'text-slate-200',
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
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0',
                    'text-orange-400',
                  )}
                  strokeWidth={2}
                  aria-hidden
                />
                <span>Pro unlocks full AI tutor + exam tools</span>
              </li>
            </ul>
          </div>

          <div
            className="mt-10 rounded-3xl border border-white/10 bg-[#0c1018] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-6 lg:p-8"
          >
            {/* Isolate color/stacking so plan cards never inherit landing `text-neutral-100` */}
            <div
              className="isolate text-slate-50"
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
