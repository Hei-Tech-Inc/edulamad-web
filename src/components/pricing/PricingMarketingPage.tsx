'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PricingPageShell } from '@/components/pricing/PricingPageShell';
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
      <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-100 via-white to-slate-100 text-slate-950 dark:from-black dark:via-slate-950 dark:to-slate-950 dark:text-slate-50">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,146,60,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(234,88,12,0.12),transparent)]"
          aria-hidden
        />
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-950 hover:text-slate-700 dark:text-white dark:hover:text-slate-200"
            >
              ← {BRAND}
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/register"
                className="hidden text-sm font-semibold text-orange-700 hover:text-orange-600 sm:inline dark:text-orange-300 dark:hover:text-orange-200"
              >
                Start free
              </Link>
              <Link
                href={user ? '/dashboard' : '/login'}
                className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white shadow-sm dark:bg-white dark:text-slate-950"
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
        <footer className="border-t border-slate-200/80 py-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
          <p>
            Payments processed securely · Semester = one term bundle vs four
            monthly renewals
          </p>
          <Link
            href="/"
            className="mt-3 inline-block font-medium text-orange-700 hover:underline dark:text-orange-400"
          >
            ← Back to home
          </Link>
        </footer>
      </div>
    </>
  );
}
