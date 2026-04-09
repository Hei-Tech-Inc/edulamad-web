import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { usePlatformOrganisations } from '@/hooks/platform/usePlatformOrganisations'
import { SkeletonNotificationRow } from '@/components/ui/skeleton'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { queryKeys } from '@/api/query-keys'

export default function PlatformTenantDirectoryPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const limit = 20

  const { data, isLoading, isError, error } = usePlatformOrganisations({
    page,
    limit,
    search,
  })
  const { refreshing, onRefresh } = usePullToRefresh([queryKeys.platform.all])

  useEffect(() => {
    if (user && user.isPlatformSuperAdmin !== true) {
      router.replace('/dashboard')
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="space-y-3 py-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonNotificationRow key={`tenant-dir-auth-skeleton-${i}`} />
        ))}
      </div>
    )
  }
  if (user.isPlatformSuperAdmin !== true) return null

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  const pag = data?.pagination
  const items = data?.items ?? []

  const btnClass =
    'inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Tenant directory
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          These requests use{' '}
          <code className="rounded bg-slate-200 px-1 font-mono text-xs dark:bg-slate-800">
            GET /platform/organisations
          </code>{' '}
          only — no act-as header. To operate workspace sites and units as the tenant owner,
          open an organisation and choose &quot;Work in tenant&quot;; the app then
          sends{' '}
          <code className="rounded bg-slate-200 px-1 font-mono text-xs dark:bg-slate-800">
            X-Act-As-Org-Id
          </code>{' '}
          on tenant routes (never on{' '}
          <code className="rounded bg-slate-200 px-1 font-mono text-xs dark:bg-slate-800">
            /platform/*
          </code>
          ).
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex max-w-xl flex-wrap items-center gap-2"
      >
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search organisations…"
          className="min-w-[200px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
        <button
          type="button"
          onClick={() => void onRefresh()}
          className={btnClass}
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </form>

      {isError ? (
        <ErrorState
          error={error?.message ?? 'Could not load organisations.'}
          onRetry={() => {
            void router.replace(router.asPath)
          }}
        />
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonNotificationRow key={`tenant-dir-list-skeleton-${i}`} />
                      ))}
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    <EmptyState
                      title="No tenants found"
                      subtitle="Try a different search query or create a new tenant."
                    />
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {row.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {row.slug ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {row.status ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/platform/organisations/${row.id}`}
                        className="text-sm font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pag && pag.pages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Page {pag.page} of {pag.pages} · {pag.total} total
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={btnClass}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pag.pages}
              onClick={() => setPage((p) => p + 1)}
              className={btnClass}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
