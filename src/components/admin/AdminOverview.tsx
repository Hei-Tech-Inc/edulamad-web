'use client';

import Link from 'next/link';
import { LayoutGrid, School, BookOpen, Upload, ListTodo } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAdminStats } from '@/hooks/admin/useAdminStats';

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
];

export function AdminOverview() {
  const statsQ = useAdminStats();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <p className="text-sm text-text-secondary">
        Manage institutions, courses, offerings, and content imports.
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
