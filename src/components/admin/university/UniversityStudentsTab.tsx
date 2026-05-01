'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminTable, type AdminColumn } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { adminApi } from '@/lib/api/admin.api';

type Row = Record<string, any>;

export function UniversityStudentsTab({ universityId }: { universityId: string }) {
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('');
  const [level, setLevel] = useState('');
  const [deptId, setDeptId] = useState('');
  const [page, setPage] = useState(1);

  const q = useQuery({
    queryKey: ['admin', 'university', universityId, 'students', { search, plan, level, deptId, page }],
    queryFn: async ({ signal }) => {
      const data = (await adminApi.universityStudents(
        universityId,
        { search, plan, level, deptId: deptId || undefined, page, limit: 25 },
        signal,
      )) as any;
      const rows = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.students)
          ? data.students
          : [];
      const total = Number(data?.total ?? data?.meta?.total ?? rows.length);
      return { ...data, data: rows, total };
    },
  });

  const columns = useMemo<AdminColumn<Row>[]>(
    () => [
      {
        key: 'name',
        label: 'Student',
        render: (r) => (
          <div>
            <p className="text-sm text-text-primary">
              {`${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || 'Unknown'}
            </p>
            <p className="text-xs text-text-muted">{r.email ?? '—'}</p>
          </div>
        ),
      },
      {
        key: 'dept',
        label: 'Department',
        render: (r) => (
          <p className="max-w-[150px] truncate text-xs text-text-muted">
            {r.departmentName ?? '—'}
          </p>
        ),
      },
      {
        key: 'level',
        label: 'Level',
        render: (r) => <span className="text-xs text-text-secondary">{r.level ? `L${r.level}` : '—'}</span>,
      },
      {
        key: 'plan',
        label: 'Plan',
        render: (r) => <span className="text-xs text-text-secondary">{r.planName ?? 'free'}</span>,
      },
      {
        key: 'streak',
        label: 'Streak',
        sortable: true,
        render: (r) => <span className="font-mono text-sm text-brand">{r.streakDays ?? 0}d</span>,
      },
      {
        key: 'joinedAt',
        label: 'Joined',
        render: (r) => (
          <span className="text-xs text-text-muted">
            {r.joinedAt ? new Date(r.joinedAt).toLocaleDateString() : '—'}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      {q.isError ? (
        <Card className="border-danger/30 bg-danger/10 text-xs text-danger">
          Failed to load students data. Please retry.
        </Card>
      ) : null}
      {q.isFetching && !q.isLoading ? (
        <p className="text-xs text-text-muted">Refreshing students data…</p>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: 'Free', value: q.data?.byPlan?.free ?? 0 },
          { label: 'Basic', value: q.data?.byPlan?.basic ?? 0 },
          { label: 'Pro', value: q.data?.byPlan?.pro ?? 0 },
          { label: 'Total', value: q.data?.total ?? 0 },
        ].map((s) => (
          <Card key={s.label} className="items-center gap-1 py-3 text-center">
            <p className="font-mono text-xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="h-9 min-w-[220px] flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand/50 focus:outline-none"
        />
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand/50 focus:outline-none"
        >
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand/50 focus:outline-none"
        >
          <option value="">All levels</option>
          {[100, 200, 300, 400, 500].map((l) => (
            <option key={l} value={String(l)}>
              Level {l}
            </option>
          ))}
        </select>
        <input
          value={deptId}
          onChange={(e) => setDeptId(e.target.value)}
          placeholder="Department id (optional)"
          className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand/50 focus:outline-none"
        />
      </div>

      <AdminTable
        columns={columns}
        data={(q.data?.data ?? []) as Row[]}
        isLoading={q.isLoading}
        total={q.data?.total ?? 0}
        page={page}
        perPage={25}
        onPageChange={setPage}
        emptyIcon="👤"
        emptyTitle="No students from this university yet"
      />
    </div>
  );
}
