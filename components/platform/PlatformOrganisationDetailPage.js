import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ArrowLeft, Building2, ExternalLink } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { usePlatformOrganisationDetail } from '@/hooks/platform/usePlatformOrganisationDetail'
import { SkeletonNotificationRow } from '@/components/ui/skeleton'
import ErrorState from '@/components/ui/ErrorState'

function pickOrg(detail) {
  return detail?.organisation ?? detail?.organization ?? null
}

function asArray(v) {
  return Array.isArray(v) ? v : []
}

export default function PlatformOrganisationDetailPage() {
  const router = useRouter()
  const orgId =
    typeof router.query.orgId === 'string' ? router.query.orgId : undefined
  const user = useAuthStore((s) => s.user)
  const setActAsOrg = useAuthStore((s) => s.setActAsOrg)

  const { data, isLoading, isError, error } = usePlatformOrganisationDetail(orgId)

  useEffect(() => {
    if (user && user.isPlatformSuperAdmin !== true) {
      router.replace('/dashboard')
    }
  }, [user, router])

  const org = useMemo(() => pickOrg(data), [data])
  const orgName =
    org && typeof org.name === 'string'
      ? org.name
      : org && typeof org.slug === 'string'
        ? org.slug
        : orgId ?? 'Organisation'

  const users = useMemo(
    () => asArray(data?.users),
    [data?.users],
  )
  const linkedSites = useMemo(
    () => asArray(data?.sites ?? data?.farms),
    [data?.sites, data?.farms],
  )
  const auditLogs = useMemo(() => {
    return asArray(data?.auditLogs ?? data?.audit_logs)
  }, [data])

  if (!user) {
    return (
      <div className="space-y-3 py-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonNotificationRow key={`org-detail-auth-skeleton-${i}`} />
        ))}
      </div>
    )
  }
  if (user.isPlatformSuperAdmin !== true) return null

  const workInTenant = () => {
    if (!orgId) return
    setActAsOrg(orgId, typeof orgName === 'string' ? orgName : null)
    router.push('/dashboard')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/platform/organisations"
            className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Tenant directory
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <Building2 className="h-7 w-7 text-sky-600 dark:text-sky-400" />
            {isLoading ? 'Loading…' : orgName}
          </h1>
          {orgId ? (
            <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
              {orgId}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={workInTenant}
          disabled={!orgId || isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ExternalLink className="h-4 w-4" />
          Work in tenant
        </button>
      </div>

      <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
        Detail comes from{' '}
        <code className="rounded bg-slate-200 px-1 font-mono text-xs dark:bg-slate-800">
          GET /platform/organisations/:orgId
        </code>
        . Use &quot;Work in tenant&quot; to attach{' '}
        <code className="rounded bg-slate-200 px-1 font-mono text-xs dark:bg-slate-800">
          X-Act-As-Org-Id
        </code>{' '}
        on subsequent tenant API calls while you stay logged in as the platform
        admin.
      </p>

      {isError ? (
        <ErrorState error={error?.message ?? 'Could not load organisation.'} onRetry={() => void router.replace(router.asPath)} />
      ) : null}

      {!isLoading && org && typeof org === 'object' ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Organisation
          </h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {Object.entries(org)
              .filter(([k]) => k !== 'password' && !String(k).toLowerCase().includes('password'))
              .map(([k, v]) => (
                <div key={k} className="flex flex-col border-b border-slate-100 pb-2 dark:border-slate-800 sm:border-0 sm:pb-0">
                  <dt className="font-mono text-xs uppercase text-slate-500">
                    {k}
                  </dt>
                  <dd className="text-slate-800 dark:text-slate-200">
                    {v == null
                      ? '—'
                      : typeof v === 'object'
                        ? JSON.stringify(v)
                        : String(v)}
                  </dd>
                </div>
              ))}
          </dl>
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
          Users ({users.length})
        </h2>
        <div className="max-h-96 overflow-auto p-4 text-sm">
          {users.length === 0 && !isLoading ? (
            <p className="text-slate-500 dark:text-slate-400">No users in payload.</p>
          ) : (
            <pre className="whitespace-pre-wrap break-all font-mono text-xs text-slate-700 dark:text-slate-300">
              {JSON.stringify(users, null, 2)}
            </pre>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
          Linked sites ({linkedSites.length})
        </h2>
        <div className="max-h-96 overflow-auto p-4 text-sm">
          {linkedSites.length === 0 && !isLoading ? (
            <p className="text-slate-500 dark:text-slate-400">No site list in payload.</p>
          ) : (
            <pre className="whitespace-pre-wrap break-all font-mono text-xs text-slate-700 dark:text-slate-300">
              {JSON.stringify(linkedSites, null, 2)}
            </pre>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
          Audit log (last entries){' '}
          <span className="font-normal text-slate-500">({auditLogs.length})</span>
        </h2>
        <div className="max-h-96 overflow-auto p-4 text-sm">
          {auditLogs.length === 0 && !isLoading ? (
            <p className="text-slate-500 dark:text-slate-400">
              No audit entries in payload.
            </p>
          ) : (
            <pre className="whitespace-pre-wrap break-all font-mono text-xs text-slate-700 dark:text-slate-300">
              {JSON.stringify(auditLogs, null, 2)}
            </pre>
          )}
        </div>
      </section>
    </div>
  )
}
