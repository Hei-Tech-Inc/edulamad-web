import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Building2,
  ChevronLeft,
  ChevronRight,
  Crown,
  ExternalLink,
  LayoutDashboard,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { usePlatformOrganisations } from '@/hooks/platform/usePlatformOrganisations';
import { usePlatformOrganisationDetail } from '@/hooks/platform/usePlatformOrganisationDetail';
import { useDeletePlatformOrganisation } from '@/hooks/platform/usePlatformOrganisationMutations';
import type { PlatformOrganisationListItem } from '@/api/types/platform.types';
import { OrganisationFormSheet } from './OrganisationFormSheet';
import {
  mergeOrganisationProfile,
  normalizePlatformInstitutionDetailPayload,
} from '@/lib/platform-institution-detail';
import { useToast } from '../Toast';
import { isApiError } from '@/lib/api-error';
import { InstitutionAccessPanel } from './InstitutionAccessPanel';
import { SkeletonNotificationRow } from '@/components/ui/skeleton';

const PLAN_KEYS = [
  'plan',
  'planName',
  'subscriptionPlan',
  'planTier',
  'tier',
  'billingPlan',
] as const;

/** Resolve commercial / billing plan label from organisation-shaped objects. */
function resolveInstitutionPlan(
  o: Record<string, unknown> | null | undefined,
): string {
  if (!o) return '—';
  for (const k of PLAN_KEYS) {
    const v = o[k];
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return '—';
}

function PlanBadge({
  plan,
  size = 'md',
}: {
  plan: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const unset = plan === '—';
  const sizes = {
    sm: 'gap-1.5 px-2.5 py-1 text-[11px]',
    md: 'gap-2 px-3 py-1.5 text-xs',
    lg: 'gap-2.5 px-4 py-2.5 text-sm',
  } as const;
  const iconSizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' } as const;
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-xl border font-bold tracking-tight ${sizes[size]} ${
        unset
          ? 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
          : 'border-amber-300/90 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-950 shadow-sm dark:border-amber-700/80 dark:from-amber-950/50 dark:to-orange-950/40 dark:text-amber-100'
      }`}
    >
      <Crown className={`shrink-0 text-amber-600 dark:text-amber-400 ${iconSizes[size]}`} />
      <span className="truncate">{unset ? 'No plan on record' : plan}</span>
    </span>
  );
}

function formatCell(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

function institutionStatusMeta(r: Record<string, unknown>): {
  label: string;
  tone: 'ok' | 'warn' | 'muted' | 'bad';
} {
  const del = r.deletedAt;
  if (del != null && String(del).trim() !== '') {
    return { label: 'Removed', tone: 'bad' };
  }
  if (typeof r.isActive === 'boolean') {
    return r.isActive
      ? { label: 'Active', tone: 'ok' }
      : { label: 'Inactive', tone: 'bad' };
  }
  const s = String(r.status ?? '').trim();
  if (!s) return { label: '—', tone: 'muted' };
  const lower = s.toLowerCase();
  if (lower.includes('pend')) return { label: s, tone: 'warn' };
  if (
    lower.includes('inact') ||
    lower.includes('suspend') ||
    lower.includes('disabled')
  ) {
    return { label: s, tone: 'bad' };
  }
  if (lower.includes('active')) return { label: s, tone: 'ok' };
  return { label: s, tone: 'muted' };
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: 'ok' | 'warn' | 'muted' | 'bad';
}) {
  const tones = {
    ok: 'border-emerald-200/90 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100',
    warn: 'border-amber-200/90 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/45 dark:text-amber-100',
    muted:
      'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300',
    bad: 'border-red-200/90 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/45 dark:text-red-100',
  } as const;
  return (
    <span
      className={`inline-flex max-w-full truncate rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

function renderInstitutionTableCell(
  k: string,
  r: Record<string, unknown>,
): ReactNode {
  if (k === 'deletedAt') {
    const v = r.deletedAt;
    if (v == null || String(v).trim() === '') return '—';
    return <StatusPill label="Removed" tone="bad" />;
  }
  if (k === 'status' || k === 'isActive') {
    const m = institutionStatusMeta(r);
    return <StatusPill label={m.label} tone={m.tone} />;
  }
  if (k === 'name') {
    return (
      <span className="font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {formatCell(r[k])}
      </span>
    );
  }
  if (k === 'slug') {
    return (
      <code className="rounded-lg border border-slate-200/90 bg-slate-100/90 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200">
        {formatCell(r[k])}
      </code>
    );
  }
  if (
    k === 'plan' ||
    k === 'planName' ||
    k === 'subscriptionPlan' ||
    k === 'planTier'
  ) {
    const p = resolveInstitutionPlan({ ...r, [k]: r[k] });
    if (p === '—') return <span className="text-slate-400">—</span>;
    return <PlanBadge plan={p} size="sm" />;
  }
  return formatCell(r[k]);
}

function KeyValueGrid({ data }: { data: Record<string, unknown> | null }) {
  if (!data || !Object.keys(data).length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">No profile data.</p>
    );
  }
  const entries = Object.entries(data).filter(
    ([k]) => !String(k).toLowerCase().includes('password'),
  );
  return (
    <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([k, v]) => (
        <div
          key={k}
          className="rounded-xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 px-3 py-2.5 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-900/60"
        >
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {k}
          </dt>
          <dd className="mt-1 break-words text-sm text-slate-900 dark:text-slate-100">
            {formatCell(v)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ObjectArrayTable({
  rows,
  emptyLabel,
}: {
  rows: unknown[];
  emptyLabel: string;
}) {
  if (!rows.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        {emptyLabel}
      </p>
    );
  }
  const keys = new Set<string>();
  rows.forEach((r) => {
    if (r && typeof r === 'object') {
      Object.keys(r as object).forEach((k) => keys.add(k));
    }
  });
  const cols = Array.from(keys).slice(0, 16);
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 dark:bg-slate-800/90">
          <tr>
            {cols.map((c) => (
              <th
                key={c}
                className="whitespace-nowrap px-3 py-2 font-semibold text-slate-600 dark:text-slate-300"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950/40">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-sky-50/40 dark:hover:bg-slate-800/30">
              {cols.map((c) => (
                <td
                  key={c}
                  className="max-w-[240px] truncate px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                  title={
                    r && typeof r === 'object'
                      ? formatCell((r as Record<string, unknown>)[c])
                      : ''
                  }
                >
                  {r && typeof r === 'object'
                    ? formatCell((r as Record<string, unknown>)[c])
                    : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type TabId =
  | 'overview'
  | 'access'
  | 'users'
  | 'linkedSites'
  | 'audit'
  | 'extra'
  | 'raw';

export default function PlatformInstitutionsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const setActAsOrg = useAuthStore((s) => s.setActAsOrg);
  const user = useAuthStore((s) => s.user);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editOrgId, setEditOrgId] = useState<string | undefined>();
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(
    null,
  );
  const [drawerTab, setDrawerTab] = useState<TabId>('overview');
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const orgQueryParam =
    typeof router.query.org === 'string' ? router.query.org : undefined;
  const selectedOrgId = orgQueryParam ?? undefined;

  const listQ = usePlatformOrganisations({
    page,
    limit,
    search,
    includeDeleted,
  });

  const selectedListRow = useMemo(() => {
    if (!selectedOrgId) return null;
    const row = listQ.data?.items?.find((r) => r.id === selectedOrgId);
    return row ? (row as unknown as Record<string, unknown>) : null;
  }, [selectedOrgId, listQ.data?.items]);

  const detailIncludeDeleted =
    includeDeleted ||
    Boolean(
      selectedListRow &&
        selectedListRow.deletedAt != null &&
        String(selectedListRow.deletedAt).trim() !== '',
    );

  const detailQ = usePlatformOrganisationDetail(selectedOrgId, {
    includeDeleted: detailIncludeDeleted,
  });

  const deleteMut = useDeletePlatformOrganisation();

  useEffect(() => {
    setPage(1);
  }, [includeDeleted]);

  useEffect(() => {
    if (user && user.isPlatformSuperAdmin !== true) {
      void router.replace('/dashboard');
    }
  }, [user, router]);

  const setOrgInUrl = useCallback(
    (orgId: string | null) => {
      const q = { ...router.query } as Record<string, string | string[]>;
      if (orgId) q.org = orgId;
      else delete q.org;
      void router.replace({ pathname: '/platform/institutions', query: q }, undefined, {
        shallow: true,
      });
    },
    [router],
  );

  const openDrawer = useCallback(
    (row: PlatformOrganisationListItem) => {
      setDrawerTab('overview');
      setOrgInUrl(row.id);
    },
    [setOrgInUrl],
  );

  const closeDrawer = useCallback(() => {
    setOrgInUrl(null);
  }, [setOrgInUrl]);

  const detailPayload = useMemo(
    () => normalizePlatformInstitutionDetailPayload(detailQ.data ?? {}),
    [detailQ.data],
  );

  const items = useMemo(
    () => listQ.data?.items ?? [],
    [listQ.data],
  );
  const pag = listQ.data?.pagination;
  const totalDirectory = pag?.total ?? items.length;

  const planSummaryLabel = useMemo(() => {
    const labels = new Set<string>();
    items.forEach((row) => {
      const p = resolveInstitutionPlan(row as unknown as Record<string, unknown>);
      if (p !== '—') labels.add(p);
    });
    if (!labels.size) return '—';
    if (labels.size <= 2) return Array.from(labels).join(' · ');
    return `${labels.size} distinct plans`;
  }, [items]);

  const statCards = useMemo(
    () => [
      {
        icon: Building2,
        label: 'Directory total',
        value: totalDirectory,
        sub: pag ? `Page ${pag.page} of ${pag.pages}` : `Page ${page}`,
      },
      {
        icon: Crown,
        label: 'Plans (this page)',
        value: planSummaryLabel,
        sub: 'From org plan fields',
      },
      {
        icon: Users,
        label: 'On this page',
        value: items.length,
        sub: listQ.isFetching ? 'Refreshing…' : 'Loaded',
      },
      {
        icon: Activity,
        label: 'Inspector',
        value: selectedOrgId ? 'Open' : '—',
        sub: selectedOrgId ? 'Live API detail' : 'Select a row',
      },
    ],
    [
      totalDirectory,
      pag,
      page,
      items.length,
      listQ.isFetching,
      selectedOrgId,
      planSummaryLabel,
    ],
  );

  const mergedOrg = useMemo(
    () =>
      mergeOrganisationProfile(
        detailPayload.organisation,
        selectedListRow,
      ),
    [detailPayload.organisation, selectedListRow],
  );

  const orgIsInactive =
    mergedOrg != null &&
    mergedOrg.deletedAt != null &&
    String(mergedOrg.deletedAt).trim() !== '';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const openCreate = () => {
    setFormMode('create');
    setEditOrgId(undefined);
    setEditingRow(null);
    setFormOpen(true);
  };

  const openEdit = (row: PlatformOrganisationListItem) => {
    setFormMode('edit');
    setEditOrgId(row.id);
    setEditingRow(row as unknown as Record<string, unknown>);
    setFormOpen(true);
  };

  const onDelete = async (orgId: string, name: string) => {
    if (
      !window.confirm(
        `Soft-delete institution "${name}"? The slug can be reused after removal. This calls DELETE /platform/organisations/:id.`,
      )
    ) {
      return;
    }
    try {
      await deleteMut.mutateAsync(orgId);
      showToast('Institution removed (soft-delete)', 'success');
      if (selectedOrgId === orgId) closeDrawer();
    } catch (err) {
      showToast(isApiError(err) ? err.message : 'Delete failed', 'error');
    }
  };

  const workAsInstitution = () => {
    if (!selectedOrgId || !mergedOrg || orgIsInactive) {
      return;
    }
    const label =
      typeof mergedOrg.name === 'string'
        ? mergedOrg.name
        : typeof mergedOrg.slug === 'string'
          ? mergedOrg.slug
          : null;
    setActAsOrg(selectedOrgId, label);
    void router.push('/dashboard');
  };

  const listRowAllKeys = useMemo(() => {
    const s = new Set<string>();
    items.forEach((row) => {
      Object.keys(row).forEach((k) => s.add(k));
    });
    return Array.from(s).sort();
  }, [items]);

  const primaryColKeys = useMemo(() => {
    const base = ['name', 'slug', 'status', 'plan', 'deletedAt', 'id'];
    const extra = listRowAllKeys.filter((k) => !base.includes(k)).slice(0, 4);
    return [...base, ...extra];
  }, [listRowAllKeys]);

  const colCount = primaryColKeys.length + 1;

  if (!user) {
    return (
      <div className="space-y-3 py-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonNotificationRow key={`inst-console-auth-skeleton-${i}`} />
        ))}
      </div>
    );
  }
  if (user.isPlatformSuperAdmin !== true) return null;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'access', label: 'Roles & members' },
    { id: 'users', label: `Users (${detailPayload.users.length})` },
    {
      id: 'linkedSites',
      label: `Linked sites (${detailPayload.linkedSites.length})`,
    },
    { id: 'audit', label: `Audit (${detailPayload.auditLogs.length})` },
    {
      id: 'extra',
      label: `More (${Object.keys(detailPayload.extraTopLevel).length})`,
    },
    { id: 'raw', label: 'Raw JSON' },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
      <nav
        className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"
        aria-label="Breadcrumb"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-2.5 py-1 dark:border-slate-700 dark:bg-slate-900">
          <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
          Platform
        </span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
          <Sparkles className="h-3.5 w-3.5 text-sky-500" />
          Institutions console
        </span>
      </nav>

      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-white shadow-xl shadow-slate-900/20 sm:px-10 sm:py-11 dark:border-slate-700/80">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_-10%,rgba(56,189,248,0.22),transparent)]" />
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-sky-200/95">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-300" />
              Platform super-admin
            </p>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Institutions console
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-300/95">
                Dedicated control room for every organisation — search and
                inspect organisations, open the live API payload, and run create / update /
                delete using the same DTOs as in{' '}
                <span className="font-mono text-orange-200/90">api-docs.json</span>.
                Switch into an institution with{' '}
                <strong className="text-white">Work as institution</strong> (
                <span className="font-mono text-[11px] text-sky-200/80">
                  X-Act-As-Org-Id
                </span>
                ); keep platform routes unscoped.
              </p>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm"
                >
                  <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <s.icon className="h-3.5 w-3.5 text-sky-300/90" />
                    {s.label}
                  </dt>
                  <dd className="mt-1 truncate text-2xl font-bold tabular-nums tracking-tight">
                    {s.value}
                  </dd>
                  <p className="mt-0.5 text-[11px] text-slate-500">{s.sub}</p>
                </div>
              ))}
            </dl>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-sky-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New institution
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/60 sm:p-5">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 xl:flex-row xl:items-center"
        >
          <div className="relative min-h-[48px] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, slug, or paste an id…"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white py-2 pl-11 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/25 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex h-12 cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-500"
                checked={includeDeleted}
                onChange={(e) => setIncludeDeleted(e.target.checked)}
              />
              Show removed
            </label>
            <button
              type="submit"
              className="h-12 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => void listQ.refetch()}
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RefreshCw
                className={`h-4 w-4 ${listQ.isFetching ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>
        </form>
      </div>

      {listQ.isError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          {listQ.error instanceof Error
            ? listQ.error.message
            : 'Failed to load institutions.'}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md ring-1 ring-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:ring-slate-800/60">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/95 dark:border-slate-800 dark:bg-slate-800/40">
                {primaryColKeys.map((k) => (
                  <th
                    key={k}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
                  >
                    {k}
                  </th>
                ))}
                <th
                  scope="col"
                  className="px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {listQ.isLoading ? (
                <tr>
                  <td
                    colSpan={colCount}
                    className="px-4 py-20 text-center text-slate-500 dark:text-slate-400"
                  >
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <SkeletonNotificationRow key={`inst-console-list-skeleton-${i}`} />
                      ))}
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={colCount}
                    className="px-4 py-20 text-center text-slate-500 dark:text-slate-400"
                  >
                    <p className="text-base font-medium text-slate-700 dark:text-slate-200">
                      No institutions match this search.
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Clear the query or add a new institution to get started.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((row) => {
                  const r = row as Record<string, unknown>;
                  const colKeys = primaryColKeys;
                  const active = selectedOrgId === row.id;
                  const rowRemoved =
                    r.deletedAt != null && String(r.deletedAt).trim() !== '';
                  return (
                    <tr
                      key={row.id}
                      className={`cursor-pointer transition-colors odd:bg-white even:bg-slate-50/40 hover:bg-sky-50/70 dark:odd:bg-slate-900 dark:even:bg-slate-900/50 dark:hover:bg-sky-950/25 ${active ? 'bg-sky-50 ring-1 ring-inset ring-sky-200/80 dark:bg-sky-950/30 dark:ring-sky-800/60' : ''} ${rowRemoved ? 'opacity-80' : ''}`}
                      onClick={() => openDrawer(row)}
                    >
                      {colKeys.map((k) => (
                        <td
                          key={k}
                          className="max-w-[220px] px-4 py-3.5 text-slate-800 dark:text-slate-200"
                          title={formatCell(r[k])}
                        >
                          <div className="truncate">{renderInstitutionTableCell(k, r)}</div>
                        </td>
                      ))}
                      <td
                        className="px-4 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-wrap justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openDrawer(row)}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-100 dark:text-sky-400 dark:hover:bg-sky-950/60"
                          >
                            Inspect
                          </button>
                          <button
                            type="button"
                            disabled={rowRemoved}
                            onClick={() => openEdit(row)}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 shadow-sm hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800"
                            title="Edit institution"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={rowRemoved}
                            onClick={() =>
                              onDelete(
                                row.id,
                                String(row.name ?? row.slug ?? row.id),
                              )
                            }
                            className="rounded-lg border border-red-100 bg-red-50/80 p-1.5 text-red-600 hover:bg-red-100 disabled:pointer-events-none disabled:opacity-40 dark:border-red-900/50 dark:bg-red-950/40 dark:hover:bg-red-950/70"
                            title={
                              rowRemoved
                                ? 'Already removed'
                                : 'Soft-delete institution'
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pag && pag.pages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          <span className="font-medium">
            Page <span className="tabular-nums">{pag.page}</span> of{' '}
            <span className="tabular-nums">{pag.pages}</span>
            <span className="text-slate-400 dark:text-slate-500">
              {' '}
              · <span className="tabular-nums">{pag.total}</span> institutions
            </span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold disabled:pointer-events-none disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pag.pages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold disabled:pointer-events-none disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <OrganisationFormSheet
        open={formOpen}
        mode={formMode}
        orgId={editOrgId}
        organisation={
          formMode === 'edit'
            ? mergeOrganisationProfile(
                editOrgId === selectedOrgId ? detailPayload.organisation : null,
                editingRow,
              )
            : null
        }
        onClose={() => {
          setFormOpen(false);
          setEditOrgId(undefined);
          setEditingRow(null);
        }}
        onSuccess={() => showToast('Saved', 'success')}
      />

      <AnimatePresence>
        {selectedOrgId ? (
          <>
            <motion.button
              key="backdrop"
              type="button"
              aria-label="Close panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-slate-950/45 backdrop-blur-[1px] sm:bg-slate-950/35"
              onClick={closeDrawer}
            />
            <motion.aside
              key="drawer"
              role="complementary"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 right-0 z-[56] flex w-full max-w-xl flex-col border-l border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:max-w-2xl"
            >
              <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50/90 to-white px-5 py-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-600 dark:text-sky-400">
                      Institution inspector
                    </p>
                    <h2 className="mt-2 flex items-center gap-2 truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
                        <Building2 className="h-5 w-5" />
                      </span>
                      <span className="truncate">
                        {mergedOrg && typeof mergedOrg.name === 'string'
                          ? mergedOrg.name
                          : 'Organisation'}
                      </span>
                    </h2>
                    <p className="mt-2 truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedOrgId}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Plan
                      </span>
                      <PlanBadge
                        plan={resolveInstitutionPlan(mergedOrg)}
                        size="lg"
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={orgIsInactive}
                      onClick={workAsInstitution}
                      title={
                        orgIsInactive
                          ? 'Organisation is soft-deleted'
                          : 'Set X-Act-As-Org-Id and open the dashboard'
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/20 hover:bg-violet-500 disabled:pointer-events-none disabled:opacity-45"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Work as institution
                    </button>
                    <button
                      type="button"
                      onClick={closeDrawer}
                      className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-200/80 dark:hover:bg-slate-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5 overflow-x-auto border-b border-slate-200 px-3 py-3 dark:border-slate-800">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDrawerTab(t.id)}
                    className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[11px] font-bold transition ${
                      drawerTab === t.id
                        ? 'bg-slate-900 text-white shadow-sm dark:bg-sky-600 dark:text-white'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {detailQ.isLoading && drawerTab !== 'raw' ? (
                  <div className="space-y-2 py-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonNotificationRow key={`inst-console-drawer-skeleton-${i}`} />
                    ))}
                  </div>
                ) : null}
                {detailQ.isError ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {detailQ.error instanceof Error
                      ? detailQ.error.message
                      : 'Detail request failed.'}
                  </p>
                ) : null}

                {drawerTab === 'overview' ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/90 to-orange-50/50 p-4 dark:border-amber-900/50 dark:from-amber-950/40 dark:to-orange-950/20">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200/90">
                        Organisation plan
                      </p>
                      <div className="mt-2">
                        <PlanBadge
                          plan={resolveInstitutionPlan(mergedOrg)}
                          size="lg"
                        />
                      </div>
                      <p className="mt-2 text-xs text-amber-900/80 dark:text-amber-200/70">
                        Pulled from organisation payload (
                        <span className="font-mono">plan</span>,{' '}
                        <span className="font-mono">subscriptionPlan</span>, etc.).
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={orgIsInactive}
                        onClick={() => {
                          if (!selectedOrgId) return;
                          openEdit({
                            ...(selectedListRow != null
                              ? (selectedListRow as object)
                              : {}),
                            id: selectedOrgId,
                          } as PlatformOrganisationListItem);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm disabled:pointer-events-none disabled:opacity-45 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit institution
                      </button>
                      <button
                        type="button"
                        disabled={orgIsInactive}
                        onClick={() =>
                          onDelete(
                            selectedOrgId!,
                            String(mergedOrg?.name ?? mergedOrg?.slug ?? selectedOrgId),
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 disabled:pointer-events-none disabled:opacity-45 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                      <Link
                        href="/platform/institutions"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400"
                        onClick={(e) => {
                          e.preventDefault();
                          closeDrawer();
                        }}
                      >
                        Clear selection
                      </Link>
                    </div>
                    <KeyValueGrid data={mergedOrg} />
                  </div>
                ) : null}

                {drawerTab === 'access' && selectedOrgId ? (
                  <InstitutionAccessPanel
                    organizationId={selectedOrgId}
                    disabled={orgIsInactive}
                  />
                ) : null}
                {drawerTab === 'users' ? (
                  <ObjectArrayTable
                    rows={detailPayload.users}
                    emptyLabel="No users in API response."
                  />
                ) : null}
                {drawerTab === 'linkedSites' ? (
                  <ObjectArrayTable
                    rows={detailPayload.linkedSites}
                    emptyLabel="No site list in API response."
                  />
                ) : null}
                {drawerTab === 'audit' ? (
                  <ObjectArrayTable
                    rows={detailPayload.auditLogs}
                    emptyLabel="No audit rows in API response."
                  />
                ) : null}
                {drawerTab === 'extra' ? (
                  <KeyValueGrid data={detailPayload.extraTopLevel} />
                ) : null}
                {drawerTab === 'raw' ? (
                  <pre className="max-h-[60vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    {JSON.stringify(
                      {
                        listRow: selectedListRow,
                        detail: detailQ.data ?? null,
                        normalized: detailPayload,
                      },
                      null,
                      2,
                    )}
                  </pre>
                ) : null}
              </div>

              <footer className="border-t border-slate-200 bg-slate-50/90 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    API:
                  </span>{' '}
                  <span className="font-mono">GET /platform/organisations</span>
                  {' · '}
                  <span className="font-mono">?includeDeleted=true</span> for
                  soft-deleted rows ·{' '}
                  <span className="font-mono">DELETE /platform/organisations/:id</span>{' '}
                  (soft-delete, <span className="font-mono">{'{ id, deletedAt }'}</span>) ·{' '}
                  <span className="font-mono">PUT /platform/organisations/:id</span> (update) ·{' '}
                  <span className="font-mono">POST /platform/organisations</span> (create) · members{' '}
                  <span className="font-mono">/admin/organizations/:id/members</span>.
                </p>
              </footer>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
