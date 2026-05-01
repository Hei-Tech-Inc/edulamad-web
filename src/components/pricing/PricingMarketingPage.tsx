'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PricingPageShell } from '@/components/pricing/PricingPageShell';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { getMarketingBrandName } from '@/lib/landing-brand';
import { useAuth } from '../../../contexts/AuthContext';

const BRAND = getMarketingBrandName();

export default function PricingMarketingPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>{`Pricing — ${BRAND}`}</title>
        <meta
          name="description"
          content={`Plans and pricing for ${BRAND}. Semester billing saves vs four monthly renewals.`}
        />
      </Head>
      <div className="relative min-h-screen overflow-x-hidden bg-bg-base text-text-primary">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_50%_0%,rgba(45,212,191,0.09),transparent_58%)] dark:opacity-95"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[min(42vh,28rem)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(251,146,60,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(234,88,12,0.07),transparent)]"
          aria-hidden
        />
        <header className="sticky top-0 z-20 border-b border-[var(--border-subtle)] bg-bg-surface/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
            <Link
              href="/"
              className="text-sm font-semibold text-text-primary transition hover:text-teal-700 dark:hover:text-teal-400"
            >
              ← {BRAND}
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle size="sm" iconOnly />
              <Link
                href="/register"
                className="hidden text-sm font-semibold text-orange-700 transition hover:text-orange-600 sm:inline dark:text-orange-300 dark:hover:text-orange-200"
              >
                Start free
              </Link>
              <Link
                href={user ? '/dashboard' : '/login'}
                className="rounded-lg border border-[var(--border-default)] bg-bg-raised px-3 py-2 text-sm font-semibold text-text-primary shadow-sm transition hover:border-teal-500/25 hover:bg-bg-hover"
              >
                {user ? 'Dashboard' : 'Sign in'}
              </Link>
            </div>
          </div>
        </header>
        <main className="relative">
          <PricingPageShell
            currentPlanId="free"
            onSelectPlan={(planId, billing) => {
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
            }}
          />
        </main>
        <footer className="border-t border-[var(--border-subtle)] py-8 text-center text-xs text-text-muted">
          <p>
            Payments processed securely · Semester = one term bundle vs four
            monthly renewals
          </p>
          <Link
            href="/"
            className="mt-3 inline-block font-medium text-orange-700 transition hover:underline dark:text-orange-400"
          >
            ← Back to home
          </Link>
        </footer>
      </div>
    </>
  );
}
