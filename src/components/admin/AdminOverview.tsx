'use client';

import Link from 'next/link';
import { useMemo } from 'react';
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
    return [{ label: 'Value', value: String(data), icon: '📊', color: 'orange' }];
  }
  const rec = data as Record<string, unknown>;
  const pairs = Object.entries(rec);
  const numeric = pairs.filter(
    ([, v]) => typeof v === 'number' && Number.isFinite(v as number),
  );
  const pick = numeric.length > 0 ? numeric : pairs.slice(0, 4);
  const colors: NonNullable<AdminStatItem['color']>[] = ['orange', 'green', 'blue', 'amber'];
  const icons = ['📊', '📈', '🎯', '✨'];
  return pick.slice(0, 4).map(([k, v], i) => ({
    label: humanizeKey(k),
    value: typeof v === 'number' ? v : String(v),
    icon: icons[i % icons.length],
    color: colors[i % colors.length],
  }));
}

function StatPreview({ data }: { data: unknown }) {
  if (data === null || data === undefined) {
    return (
      <p className="text-sm text-text-muted">No stats returned (check permissions).</p>
    );
  }
  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>).slice(0, 8);
    return (
      <dl className="grid gap-2 sm:grid-cols-2">
        {entries.map(([k, v]) => (
          <div
            key={k}
            className="rounded-lg border border-white/10 bg-bg-surface px-3 py-2"
          >
            <dt className="text-[11px] font-medium text-text-muted">{k}</dt>
            <dd className="font-mono text-sm text-text-primary">
              {typeof v === 'object' ? JSON.stringify(v) : String(v)}
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <p className="font-mono text-sm text-text-primary">{String(data)}</p>
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

export function AdminOverview() {
  const statsQ = useAdminStats();
  const quickStats = useMemo(() => toQuickStats(statsQ.data), [statsQ.data]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <p className="text-sm text-text-secondary">
        Manage institutions, courses, offerings, and content workflows. Lists hit bundled OpenAPI routes
        where available; otherwise you will see a clear API error.
      </p>

      <section>
        <h2 className="mb-3 text-xs font-semibold tracking-wider text-text-secondary uppercase">
          Server snapshot
        </h2>
        <Card className="p-4">
          {statsQ.isLoading ? (
            <p className="text-sm text-text-muted">Loading stats…</p>
          ) : statsQ.isError ? (
            <p className="text-sm text-danger">
              Could not load admin stats. You may need elevated API access.
            </p>
          ) : quickStats.length > 0 ? (
            <div className="flex flex-col gap-4">
              <AdminQuickStats stats={quickStats} />
              <details className="text-xs text-text-muted">
                <summary className="cursor-pointer select-none text-text-secondary hover:text-text-primary">
                  Raw payload
                </summary>
                <div className="mt-2">
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
        <h2 className="mb-3 text-xs font-semibold tracking-wider text-text-secondary uppercase">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.href} href={a.href}>
                <Card className="h-full cursor-pointer p-4 transition-colors hover:border-brand/30">
                  <Icon className="mb-2 h-6 w-6 text-brand" aria-hidden />
                  <p className="text-sm font-semibold text-text-primary">{a.title}</p>
                  <p className="mt-1 text-xs text-text-muted">{a.desc}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-white/15 bg-bg-surface/50 p-4 text-sm text-text-secondary">
        <p>
          <strong className="text-text-primary">Hierarchy:</strong> University → College →
          Department → Course → Offering → assessments & questions. Use{' '}
          <Link href="/admin/institutions" className="text-brand hover:underline">
            Institutions
          </Link>{' '}
          and{' '}
          <Link href="/admin/courses" className="text-brand hover:underline">
            Courses
          </Link>{' '}
          to walk the tree.
        </p>
      </section>
    </div>
  );
}
