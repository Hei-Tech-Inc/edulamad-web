'use client';

import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';
import {
  LayoutGrid,
  School,
  BookOpen,
  Upload,
  ListTodo,
  Ticket,
  ClipboardList,
  Users,
  ScrollText,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AdminQuickStats, type AdminStatItem } from '@/components/admin/AdminQuickStats';
import { useAdminStats } from '@/hooks/admin/useAdminStats';

function humanizeKey(k: string): string {
  return k
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}

function toQuickStats(data: unknown): AdminStatItem[] {
  if (data === null || data === undefined) return [];
  if (typeof data !== 'object') {
    return [{ label: 'Value', value: String(data) }];
  }
  const rec = data as Record<string, unknown>;
  const pairs = Object.entries(rec);
  const numeric = pairs.filter(
    ([, v]) => typeof v === 'number' && Number.isFinite(v as number),
  );
  const pick = numeric.length > 0 ? numeric : pairs.slice(0, 4);
  return pick.slice(0, 4).map(([k, v]) => ({
    label: humanizeKey(k),
    value: typeof v === 'number' ? v : String(v),
  }));
}

function StatPreview({ data }: { data: unknown }) {
  if (data === null || data === undefined) {
    return (
      <p className="text-sm text-white/55">No stats returned (check permissions).</p>
    );
  }
  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>).slice(0, 8);
    return (
      <dl className="grid gap-2 sm:grid-cols-2">
        {entries.map(([k, v]) => (
          <div
            key={k}
            className="rounded-lg border border-white/[0.07] bg-black/20 px-3 py-2.5"
          >
            <dt className="text-[11px] font-medium uppercase tracking-wide text-white/45">
              {k}
            </dt>
            <dd className="mt-1 font-mono text-sm text-white/90">
              {typeof v === 'object' ? JSON.stringify(v) : String(v)}
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <p className="font-mono text-sm text-white/90">{String(data)}</p>
  );
}

const QUICK: {
  href: string;
  title: string;
  desc: string;
  icon: typeof LayoutGrid;
}[] = [
  {
    href: '/admin/institutions',
    title: 'Institutions',
    desc: 'Universities, colleges, departments',
    icon: School,
  },
  {
    href: '/admin/courses',
    title: 'Courses',
    desc: 'Browse and edit catalog courses',
    icon: BookOpen,
  },
  {
    href: '/admin/content/pending-review',
    title: 'Pending questions',
    desc: 'Content review queue',
    icon: ClipboardList,
  },
  {
    href: '/admin/promo-codes',
    title: 'Promo codes',
    desc: 'Discount and trial codes',
    icon: Ticket,
  },
  {
    href: '/admin/questions/upload',
    title: 'JSON upload',
    desc: 'Bulk question import',
    icon: Upload,
  },
  {
    href: '/dashboard?admin=catalog#admin-upload-queue',
    title: 'Upload queue',
    desc: 'Review pending uploads',
    icon: ListTodo,
  },
  {
    href: '/admin/leaderboard',
    title: 'Leaderboard',
    desc: 'Gamification standings',
    icon: Users,
  },
  {
    href: '/admin/audit-logs',
    title: 'Audit logs',
    desc: 'Accountability trail',
    icon: ScrollText,
  },
];

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 text-[11px] font-semibold tracking-[0.14em] text-white/45 uppercase">
      {children}
    </h2>
  );
}

export function AdminOverview() {
  const statsQ = useAdminStats();
  const quickStats = useMemo(() => toQuickStats(statsQ.data), [statsQ.data]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <p className="max-w-3xl text-[15px] leading-relaxed text-white/70">
        Manage institutions, courses, offerings, and content workflows. Lists use bundled OpenAPI
        routes where available; otherwise you will see a clear API error.
      </p>

      <section>
        <SectionLabel>Server snapshot</SectionLabel>
        <Card className="border-white/[0.07] bg-bg-surface/80 p-5 shadow-lg shadow-black/30 backdrop-blur-sm">
          {statsQ.isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {[1, 2, 3, 4].map((k) => (
                <div
                  key={k}
                  className="h-28 animate-pulse rounded-xl bg-white/[0.06]"
                />
              ))}
            </div>
          ) : statsQ.isError ? (
            <p className="text-sm text-danger">
              Could not load admin stats. You may need elevated API access.
            </p>
          ) : quickStats.length > 0 ? (
            <div className="flex flex-col gap-5">
              <AdminQuickStats stats={quickStats} />
              <details className="group/details rounded-lg border border-white/[0.06] bg-black/15 px-3 py-2">
                <summary className="cursor-pointer list-none text-xs font-medium text-white/55 outline-none transition-colors hover:text-white/80 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-2">
                    Raw payload
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open/details:rotate-90" />
                  </span>
                </summary>
                <div className="mt-3 border-t border-white/[0.06] pt-3">
                  <StatPreview data={statsQ.data} />
                </div>
              </details>
            </div>
          ) : (
            <StatPreview data={statsQ.data} />
          )}
        </Card>
      </section>

      <section>
        <SectionLabel>Quick actions</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.href} href={a.href} className="group block outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base rounded-xl">
                <Card className="relative h-full gap-0 overflow-hidden border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent p-0 shadow-md shadow-black/25 transition-all duration-200 hover:border-brand/35 hover:shadow-lg hover:shadow-brand/[0.07] active:scale-[0.99]">
                  <div className="flex flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/14 text-brand ring-1 ring-brand/20 transition-colors group-hover:bg-brand/20">
                        <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                      </span>
                      <ChevronRight
                        className="mt-1 h-5 w-5 shrink-0 text-white/25 transition-all group-hover:translate-x-0.5 group-hover:text-brand/80"
                        aria-hidden
                      />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold tracking-tight text-white">
                        {a.title}
                      </p>
                      <p className="mt-1.5 text-[13px] leading-snug text-white/55">
                        {a.desc}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-brand/15 bg-gradient-to-br from-brand/[0.06] via-transparent to-transparent px-5 py-5 text-[15px] leading-relaxed text-white/65 shadow-inner shadow-black/20">
        <p>
          <span className="font-semibold text-white">Hierarchy:</span>{' '}
          University → College → Department → Course → Offering → assessments & questions. Use{' '}
          <Link
            href="/admin/institutions"
            className="font-medium text-brand underline decoration-brand/40 underline-offset-2 transition-colors hover:text-brand hover:decoration-brand"
          >
            Institutions
          </Link>{' '}
          and{' '}
          <Link
            href="/admin/courses"
            className="font-medium text-brand underline decoration-brand/40 underline-offset-2 transition-colors hover:text-brand hover:decoration-brand"
          >
            Courses
          </Link>{' '}
          to walk the tree.
        </p>
      </section>
    </div>
  );
}
