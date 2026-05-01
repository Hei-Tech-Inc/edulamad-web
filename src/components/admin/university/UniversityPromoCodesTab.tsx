'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AdminTable, type AdminColumn } from '@/components/admin/AdminTable';
import { EditDrawer } from '@/components/admin/entity/EditDrawer';
import { Card } from '@/components/ui/card';
import { adminApi } from '@/lib/api/admin.api';

type Row = Record<string, any>;

function CreatePromoCodeForm({
  universityId,
  onSuccess,
}: {
  universityId: string;
  onSuccess: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    code: '',
    type: 'question_credits',
    creditAmount: '50',
    maxRedemptions: '100',
  });
  const [error, setError] = useState('');
  const m = useMutation({
    mutationFn: () =>
      adminApi.createUniversityPromo(universityId, {
        code: form.code.trim(),
        type: form.type,
        creditAmount: Number.parseInt(form.creditAmount, 10),
        maxRedemptions: Number.parseInt(form.maxRedemptions, 10),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ['admin', 'university', universityId, 'promo-codes'],
      });
      onSuccess();
    },
    onError: (e) =>
      setError(e instanceof Error ? e.message : 'Failed to create promo code.'),
  });

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs text-text-muted">
        Code *
        <input
          value={form.code}
          onChange={(e) => setForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))}
          placeholder="e.g. UNI50BONUS"
          className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand/50 focus:outline-none"
        />
      </label>
      <label className="text-xs text-text-muted">
        Type
        <select
          value={form.type}
          onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
          className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand/50 focus:outline-none"
        >
          <option value="question_credits">Question credits</option>
          <option value="plan_unlock">Plan unlock</option>
          <option value="discount">Discount</option>
        </select>
      </label>
      <label className="text-xs text-text-muted">
        Credit amount
        <input
          value={form.creditAmount}
          onChange={(e) => setForm((s) => ({ ...s, creditAmount: e.target.value }))}
          className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand/50 focus:outline-none"
        />
      </label>
      <label className="text-xs text-text-muted">
        Max redemptions
        <input
          value={form.maxRedemptions}
          onChange={(e) => setForm((s) => ({ ...s, maxRedemptions: e.target.value }))}
          className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand/50 focus:outline-none"
        />
      </label>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      <Button
        type="button"
        disabled={m.isPending || !form.code.trim()}
        onClick={() => void m.mutateAsync()}
      >
        {m.isPending ? 'Creating…' : 'Create promo code'}
      </Button>
    </div>
  );
}

export function UniversityPromoCodesTab({
  universityId,
  universityName,
}: {
  universityId: string;
  universityName: string;
}) {
  const [createOpen, setCreateOpen] = useState(false);

  const q = useQuery({
    queryKey: ['admin', 'university', universityId, 'promo-codes'],
    queryFn: async ({ signal }) => {
      const data = (await adminApi.universityPromoCodes(universityId, signal)) as any;
      const rows = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.promoCodes)
          ? data.promoCodes
          : [];
      return { ...(data ?? {}), data: rows, total: Number(data?.total ?? rows.length) };
    },
  });

  const columns: AdminColumn<Row>[] = [
    {
      key: 'code',
      label: 'Code',
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-brand">{r.code}</span>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(String(r.code ?? ''))}
            className="text-xs text-text-muted hover:text-brand"
          >
            Copy
          </button>
        </div>
      ),
    },
    { key: 'type', label: 'Type', render: (r) => <span className="text-xs text-text-secondary">{r.type}</span> },
    {
      key: 'value',
      label: 'Value',
      render: (r) => (
        <span className="font-mono text-sm text-text-primary">
          {r.type === 'question_credits'
            ? `+${r.creditAmount ?? 0} credits`
            : r.type === 'plan_unlock'
              ? r.planName ?? 'plan'
              : `${r.discountPercent ?? 0}% off`}
        </span>
      ),
    },
    {
      key: 'usage',
      label: 'Usage',
      render: (r) => (
        <span className="font-mono text-sm text-text-primary">
          {r.redemptionCount ?? 0}
          {r.maxRedemptions ? ` / ${r.maxRedemptions}` : ''}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <span className="text-xs text-text-secondary">{r.isActive === false ? 'Inactive' : 'Active'}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {q.isError ? (
        <Card className="border-danger/30 bg-danger/10 text-xs text-danger">
          Failed to load promo codes. Please retry.
        </Card>
      ) : null}
      {q.isFetching && !q.isLoading ? (
        <p className="text-xs text-text-muted">Refreshing promo-code data…</p>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          Promo codes redeemable by {universityName} students
        </p>
        <Button variant="default" size="sm" onClick={() => setCreateOpen(true)}>
          + Create promo code
        </Button>
      </div>

      <AdminTable
        columns={columns}
        data={(q.data?.data ?? []) as Row[]}
        isLoading={q.isLoading}
        total={q.data?.total ?? 0}
        page={1}
        perPage={50}
        onPageChange={() => {}}
        emptyIcon="🎫"
        emptyTitle="No promo codes for this university"
      />

      <EditDrawer
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create university promo code"
        subtitle={`Only redeemable by ${universityName} students`}
      >
        <CreatePromoCodeForm
          universityId={universityId}
          onSuccess={() => setCreateOpen(false)}
        />
      </EditDrawer>
    </div>
  );
}
