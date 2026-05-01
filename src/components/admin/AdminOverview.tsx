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
  ArrowRight,
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
      <p className="text-sm text-slate-300">No stats returned (check permissions).</p>
    );
  }
  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>).slice(0, 8);
    return (
      <dl className="grid gap-2 sm:grid-cols-2">
        {entries.map(([k, v]) => (
          <div
            key={k}
            className="rounded-lg border border-white/10 bg-[#0f2347] px-3 py-2.5"
          >
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-300/80">
              {k}
            </dt>
            <dd className="mt-1 font-mono text-sm text-white">
              {typeof v === 'object' ? JSON.stringify(v) : String(v)}
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <p className="font-mono text-sm text-white">{String(data)}</p>
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
    <h2 className="mb-4 text-[11px] font-semibold tracking-[0.14em] text-slate-600 uppercase">
      {children}
    </h2>
  );
}

export function AdminOverview() {
  const statsQ = useAdminStats();
  const quickStats = useMemo(() => toQuickStats(statsQ.data), [statsQ.data]);
  const hierarchySteps = [
    'University',
    'College',
    'Department',
    'Course',
    'Offering',
    'Assessments & questions',
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <p className="max-w-3xl text-[15px] leading-relaxed text-slate-700">
        Manage institutions, courses, offerings, and content workflows. Lists use bundled OpenAPI
        routes where available; otherwise you will see a clear API error.
      </p>

      <section>
        <SectionLabel>Server snapshot</SectionLabel>
        <Card className="border-slate-200 bg-[#102449] p-5 text-white shadow-lg shadow-slate-900/30">
          {statsQ.isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {[1, 2, 3, 4].map((k) => (
                <div
                  key={k}
                  className="h-28 animate-pulse rounded-xl bg-white/10"
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
              <details className="group/details rounded-lg border border-white/10 bg-[#0d1f41] px-3 py-2">
                <summary className="cursor-pointer list-none text-xs font-medium text-slate-300 outline-none transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-2">
                    Raw payload
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open/details:rotate-90" />
                  </span>
                </summary>
                <div className="mt-3 border-t border-white/10 pt-3">
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
              <Link key={a.href} href={a.href} className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50">
                <Card className="relative h-full gap-0 overflow-hidden border-slate-200 bg-[#102449] p-0 text-white shadow-md shadow-slate-900/25 transition-all duration-200 hover:border-brand/35 hover:shadow-lg hover:shadow-brand/[0.10] active:scale-[0.99]">
                  <div className="flex flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/14 text-brand ring-1 ring-brand/20 transition-colors group-hover:bg-brand/20">
                        <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                      </span>
                      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-white/35 transition-all group-hover:translate-x-0.5 group-hover:text-brand/90" aria-hidden />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold tracking-tight text-white">
                        {a.title}
                      </p>
                      <p className="mt-1.5 text-[13px] leading-snug text-slate-200/85">
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

      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">Catalog hierarchy</h3>
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/admin/institutions"
              className="rounded-full border border-brand/25 bg-brand/10 px-2.5 py-1 font-semibold text-brand hover:bg-brand/15"
            >
              Open Institutions
            </Link>
            <Link
              href="/admin/courses"
              className="rounded-full border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Open Courses
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hierarchySteps.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                {step}
              </span>
              {i < hierarchySteps.length - 1 ? (
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
