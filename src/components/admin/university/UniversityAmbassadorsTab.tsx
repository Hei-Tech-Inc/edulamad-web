'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminTable, type AdminColumn } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/admin/entity/ConfirmDialog';
import { ambassadorsApi } from '@/lib/api/ambassadors.api';

type Row = Record<string, any>;

export function UniversityAmbassadorsTab({ universityId }: { universityId: string }) {
  const [status, setStatus] = useState('');
  const [approveId, setApproveId] = useState<string | null>(null);
  const [suspendId, setSuspendId] = useState<string | null>(null);
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ['admin', 'university', universityId, 'ambassadors', status],
    queryFn: async ({ signal }) => {
      const { data } = await ambassadorsApi.getByUniversity(
        universityId,
        { status: status || undefined },
        signal,
      );
      const payload = data as Record<string, unknown>;
      const ambassadors = Array.isArray(payload?.ambassadors)
        ? payload.ambassadors
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      return { ...(payload as any), ambassadors };
    },
  });

  const columns: AdminColumn<Row>[] = [
    {
      key: 'name',
      label: 'Ambassador',
      render: (r) => (
        <div>
          <p className="text-sm text-text-primary">
            {`${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || 'Unknown'}
          </p>
          <p className="text-xs font-mono text-text-muted">{r.referralCode ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <span className="text-xs text-text-secondary">{r.status ?? 'pending'}</span>,
    },
    {
      key: 'referrals',
      label: 'Referrals',
      render: (r) => (
        <span className="font-mono text-sm text-text-primary">
          {r.successfulReferrals ?? 0} / {r.totalReferrals ?? 0}
        </span>
      ),
    },
    {
      key: 'creditsEarned',
      label: 'Credits',
      render: (r) => <span className="font-mono text-sm text-brand">{r.creditsEarned ?? 0}</span>,
    },
    {
      key: 'joinedAt',
      label: 'Applied',
      render: (r) => (
        <span className="text-xs text-text-muted">
          {r.joinedAt ? new Date(r.joinedAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {q.isError ? (
        <Card className="border-danger/30 bg-danger/10 text-xs text-danger">
          Failed to load ambassadors data. Please retry.
        </Card>
      ) : null}
      {q.isFetching && !q.isLoading ? (
        <p className="text-xs text-text-muted">Refreshing ambassador data…</p>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: 'Active', value: q.data?.stats?.active ?? 0 },
          { label: 'Pending', value: q.data?.stats?.pending ?? 0 },
          { label: 'Total refs', value: q.data?.stats?.totalReferrals ?? 0 },
          { label: 'Credits', value: q.data?.stats?.creditsEarned ?? 0 },
        ].map((s) => (
          <Card key={s.label} className="items-center gap-1 py-3 text-center">
            <p className="font-mono text-xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </Card>
        ))}
      </div>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-9 w-fit rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand/50 focus:outline-none"
      >
        <option value="">All ambassadors</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="suspended">Suspended</option>
      </select>

      <AdminTable
        columns={columns}
        data={(q.data?.ambassadors ?? []) as Row[]}
        isLoading={q.isLoading}
        total={(q.data?.ambassadors ?? []).length}
        page={1}
        perPage={50}
        onPageChange={() => {}}
        onEdit={(r) => (r.status === 'pending' ? setApproveId(String(r._id ?? r.id)) : undefined)}
        onDelete={(r) =>
          r.status === 'active' ? setSuspendId(String(r._id ?? r.id)) : undefined
        }
        emptyIcon="🤝"
        emptyTitle="No ambassadors yet"
      />

      <ConfirmDialog
        isOpen={Boolean(approveId)}
        onClose={() => setApproveId(null)}
        onConfirm={async () => {
          if (!approveId) return;
          await ambassadorsApi.approve(approveId);
          setApproveId(null);
          await qc.invalidateQueries({
            queryKey: ['admin', 'university', universityId, 'ambassadors'],
          });
        }}
        title="Approve ambassador"
        message="This will activate ambassador status and allow referral credit earnings."
        confirmLabel="Approve"
        variant="warning"
      />
      <ConfirmDialog
        isOpen={Boolean(suspendId)}
        onClose={() => setSuspendId(null)}
        onConfirm={async () => {
          if (!suspendId) return;
          await ambassadorsApi.suspend(suspendId, 'Suspended by university admin');
          setSuspendId(null);
          await qc.invalidateQueries({
            queryKey: ['admin', 'university', universityId, 'ambassadors'],
          });
        }}
        title="Suspend ambassador"
        message="This will suspend this ambassador from earning referral credits."
        confirmLabel="Suspend"
        variant="danger"
      />
    </div>
  );
}
