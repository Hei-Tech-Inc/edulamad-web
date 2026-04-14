'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getMarketingBrandName } from '@/lib/landing-brand';

const BRAND = getMarketingBrandName();

export default function PaymentCallbackContent() {
  const router = useRouter();
  const { reference } = router.query;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ref = typeof reference === 'string' ? reference : '';

  return (
    <>
      <Head>
        <title>{`Payment — ${BRAND}`}</title>
      </Head>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-16">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Payment status
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          If you completed checkout, your subscription updates shortly. Open your profile to confirm
          plan access.
        </p>
        {mounted && ref ? (
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            Reference: {ref}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/profile/subscription"
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            View subscription
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
