'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { sessionHasAdminTools } from '@/lib/session-admin-access';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import Layout from '../../../components/Layout';

export function AdminPortalShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s._hasHydrated);
  const can = sessionHasAdminTools(user, accessToken);

  useEffect(() => {
    if (!hydrated) return;
    if (!can) void router.replace('/dashboard');
  }, [hydrated, can, router]);

  if (!hydrated || !can) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-base text-sm text-text-muted">
        Loading…
      </div>
    );
  }

  function isActive(href: string, match?: 'exact' | 'prefix'): boolean {
    const pathname = router.pathname;
    if (match === 'exact') return pathname === href;
    if (match === 'prefix') return pathname === href || pathname.startsWith(`${href}/`);
    return pathname === href;
  }

  function AdminChip({
    href,
    label,
    match = 'prefix',
  }: {
    href: string;
    label: string;
    match?: 'exact' | 'prefix';
  }) {
    const active = isActive(href, match);
    return (
      <Link
        href={href}
        className={cn(
          'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
          active
            ? 'border-brand/50 bg-brand text-white shadow-sm shadow-brand/35'
            : 'border-white/20 bg-white/10 text-white/85 hover:bg-white/20',
        )}
      >
        {label}
      </Link>
    );
  }

  return (
    <Layout title={title}>
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.25),transparent_40%),linear-gradient(135deg,#0b1736,#0a1228_58%,#0b1632)] px-6 py-7 text-white shadow-[0_14px_38px_rgba(2,8,23,0.18)]">
          <p className="mb-2 inline-flex rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
            Admin console
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/75">
            Manage catalogue records, content pipeline, and operational controls from one workspace.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <AdminChip href="/admin" label="Overview" match="exact" />
            <AdminChip href="/admin/institutions" label="Institutions" />
            <AdminChip href="/admin/courses" label="Courses" />
            <AdminChip href="/admin/content/pending-review" label="Pending review" />
            <AdminChip href="/admin/promo-codes" label="Promo codes" />
            <AdminChip href="/admin/audit-logs" label="Audit logs" />
          </div>
        </section>
        {children}
      </div>
    </Layout>
  );
}
