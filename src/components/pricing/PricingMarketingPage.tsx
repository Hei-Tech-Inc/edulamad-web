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
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <header className="border-b border-slate-200 dark:border-slate-800">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-900 dark:text-white"
            >
              ← {BRAND}
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/register"
                className="text-sm font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400"
              >
                Start studying for free
              </Link>
              <Link
                href={user ? '/dashboard' : '/login'}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
              >
                {user ? 'Dashboard' : 'Sign in'}
              </Link>
            </div>
          </div>
        </header>
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
      </div>
    </>
  );
}
