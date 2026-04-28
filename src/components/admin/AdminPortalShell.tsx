'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { sessionHasAdminTools } from '@/lib/session-admin-access';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';

const SECTIONS: {
  title: string;
  items: { href: string; label: string; match?: 'exact' | 'prefix' }[];
}[] = [
  {
    title: 'Catalog',
    items: [
      { href: '/admin', label: 'Overview', match: 'exact' },
      { href: '/admin/institutions', label: 'Institutions', match: 'prefix' },
      { href: '/admin/courses', label: 'Courses', match: 'prefix' },
      { href: '/admin/questions/upload', label: 'JSON upload', match: 'prefix' },
      {
        href: '/dashboard?admin=catalog#admin-upload-queue',
        label: 'Dashboard upload queue',
      },
    ],
  },
  {
    title: 'Content pipeline',
    items: [
      { href: '/admin/content/pending-review', label: 'Pending questions', match: 'prefix' },
      { href: '/admin/content/manual-queue', label: 'Manual queue', match: 'prefix' },
      { href: '/admin/questions-upload-queue', label: 'Questions queue', match: 'prefix' },
      { href: '/admin/ta-upload-queue', label: 'TA upload queue', match: 'prefix' },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { href: '/admin/quiz-history', label: 'Quiz history', match: 'prefix' },
      { href: '/admin/discussions', label: 'Discussions', match: 'prefix' },
      { href: '/admin/leaderboard', label: 'Leaderboard', match: 'prefix' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/admin/promo-codes', label: 'Promo codes', match: 'prefix' },
      { href: '/admin/server-notifications', label: 'Server notifications', match: 'prefix' },
      { href: '/admin/audit-logs', label: 'Audit logs', match: 'prefix' },
    ],
  },
  {
    title: 'More',
    items: [
      { href: '/dashboard?admin=create', label: 'Dashboard tools' },
      { href: '/developer/api-reference', label: 'API reference' },
    ],
  },
];

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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!can) void router.replace('/dashboard');
  }, [hydrated, can, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [router.asPath]);

  if (!hydrated || !can) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-base text-sm text-text-muted">
        Loading…
      </div>
    );
  }

  const pathname = router.pathname;

  function isActive(
    href: string,
    match?: 'exact' | 'prefix',
  ): boolean {
    if (href.startsWith('/dashboard')) return false;
    if (match === 'exact') return pathname === href;
    if (match === 'prefix')
      return pathname === href || pathname.startsWith(`${href}/`);
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function NavLink({
    href,
    label,
    match,
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
          'rounded-lg px-2 py-2 text-sm transition-colors',
          active
            ? 'bg-brand/15 font-medium text-brand'
            : 'text-text-muted hover:bg-bg-raised hover:text-text-primary',
        )}
      >
        {label}
      </Link>
    );
  }

  return (
    <div className="flex min-h-dvh bg-bg-base text-text-primary">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-white/[0.06] bg-bg-surface lg:static lg:z-auto',
          mobileOpen ? 'flex' : 'hidden lg:flex',
        )}
      >
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
            E
          </div>
          <div>
            <p className="text-xs font-semibold text-text-primary">Edulamad</p>
            <p className="text-[10px] text-text-muted">Admin portal</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="mb-1.5 px-2 text-[10px] font-semibold tracking-wider text-text-muted uppercase">
                {section.title}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    match={item.match}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/[0.06] px-3 py-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-muted hover:bg-bg-raised hover:text-text-primary"
          >
            ← Back to app
          </Link>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/[0.06] bg-bg-surface px-4 py-3 lg:hidden">
          <button
            type="button"
            className="rounded-lg border border-white/10 p-2 text-text-primary"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
          <span className="text-sm font-semibold">{title}</span>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 lg:p-6">
          <div className="mb-6 hidden lg:block">
            <h1 className="font-display text-2xl font-bold text-text-primary">
              {title}
            </h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
