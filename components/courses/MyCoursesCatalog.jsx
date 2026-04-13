import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowDownWideNarrow,
  Filter,
  LayoutGrid,
  Loader2,
  Search,
} from 'lucide-react'
import MyCourseCard from './MyCourseCard'
import { useMyCoursesInfinite } from '@/hooks/students/useMyCourses'
import { normalizeStudentLevel } from '@/lib/courses/normalize-student-level'
import { usePersonalisationStore } from '@/stores/personalisation.store'

function mapContentFilter(id) {
  if (id === 'questions') return 'has_questions'
  if (id === 'slides') return 'has_slides'
  if (id === 'full') return 'has_both'
  return 'all'
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="aspect-[16/10] animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-[85%] animate-pulse rounded bg-slate-200" />
        <div className="h-2 w-full animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  )
}

export default function MyCoursesCatalog({ selectedYear, selectedLevel, department, university }) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [contentFilter, setContentFilter] = useState('all')
  const [sortKey, setSortKey] = useState('title_asc')
  const [statusFilter, setStatusFilter] = useState('all')
  const loadMoreRef = useRef(null)

  const uniName = university?.name || ''
  const level = normalizeStudentLevel(selectedLevel)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 320)
    return () => clearTimeout(t)
  }, [search])

  const contentApi = useMemo(() => mapContentFilter(contentFilter), [contentFilter])

  const myCoursesQ = useMyCoursesInfinite({
    year: selectedYear,
    level,
    search: debouncedSearch,
    content: contentApi,
    sort: sortKey,
    status: statusFilter,
  })

  const rows = useMemo(
    () => myCoursesQ.data?.pages.flatMap((p) => p.data) ?? [],
    [myCoursesQ.data],
  )

  const setCurrentSemesterCourses = usePersonalisationStore((s) => s.setCurrentSemesterCourses)

  useEffect(() => {
    if (myCoursesQ.status !== 'success') return
    const ids = rows.map((r) => r.courseId).filter(Boolean)
    setCurrentSemesterCourses(ids)
  }, [myCoursesQ.status, rows, setCurrentSemesterCourses])

  const metaFirst = myCoursesQ.data?.pages[0]?.meta
  const profileIncomplete = Boolean(metaFirst?.profileIncomplete)
  const totalCount = metaFirst?.totalCount ?? rows.length

  const fetchNextPage = myCoursesQ.fetchNextPage
  const hasNextPage = myCoursesQ.hasNextPage
  const isFetchingNext = myCoursesQ.isFetchingNextPage

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNext) fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNext])

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el || !hasNextPage) return undefined
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '160px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasNextPage, loadMore])

  const filterChips = [
    { id: 'all', label: 'All' },
    { id: 'questions', label: 'Has questions' },
    { id: 'slides', label: 'Has slides' },
    { id: 'full', label: 'Questions + slides' },
  ]

  if (myCoursesQ.isError) {
    return (
      <p className="mt-4 text-sm text-rose-700">
        Could not load your courses. Check your connection and try again.
      </p>
    )
  }

  if (myCoursesQ.isPending) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={`sk-${i}`} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {profileIncomplete ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Complete onboarding (university and department) so we can match courses to your profile.{' '}
          <Link href="/onboarding" className="font-semibold text-amber-900 underline">
            Continue setup
          </Link>
        </div>
      ) : null}

      <p className="text-xs leading-relaxed text-slate-500">
        Prep coverage uses indexed questions and slides for your level and year. Enrollment-style progress appears
        here when the API provides it.
      </p>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by course code or title…"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            aria-label="Search courses"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Filter className="h-3.5 w-3.5" aria-hidden />
            Content
          </span>
          <div className="flex flex-wrap gap-1.5">
            {filterChips.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setContentFilter(c.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  contentFilter === c.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <ArrowDownWideNarrow className="h-3.5 w-3.5" aria-hidden />
            Sort
          </span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            aria-label="Sort courses"
          >
            <option value="title_asc">Title A → Z</option>
            <option value="title_desc">Title Z → A</option>
            <option value="last_activity_desc">Last activity</option>
            <option value="completion_desc">Completion</option>
            <option value="readiness_desc">Highest prep coverage</option>
            <option value="questions_desc">Most questions</option>
            <option value="slides_desc">Most slides</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            aria-label="Filter by status"
          >
            <option value="all">All</option>
            <option value="not_started">Not started</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <p className="inline-flex items-center gap-2 text-sm text-slate-600">
          <LayoutGrid className="h-4 w-4 text-slate-400" aria-hidden />
          <span>
            <strong className="text-slate-900">{totalCount}</strong> course{totalCount === 1 ? '' : 's'}
            {uniName ? (
              <>
                {' '}
                · <span className="text-slate-500">{uniName}</span>
              </>
            ) : null}
          </span>
        </p>
      </div>

      {!profileIncomplete && rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
          <p className="text-sm font-medium text-slate-800">No courses match your filters</p>
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setContentFilter('all')
              setStatusFilter('all')
            }}
            className="mt-3 text-sm font-semibold text-orange-700 hover:text-orange-800"
          >
            Clear search & filters
          </button>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => (
              <MyCourseCard
                key={row.courseId}
                course={{
                  id: row.courseId,
                  code: row.code ?? '',
                  name: row.name,
                }}
                stats={{
                  questionCount: row.questionCount,
                  slidesCount: row.slidesCount,
                }}
                statsLoading={false}
                departmentName={row.departmentName}
                instructorName={row.instructor?.name}
                thumbnailUrl={typeof row.thumbnailUrl === 'string' ? row.thumbnailUrl : null}
                enrollmentStatus={row.enrollmentStatus ?? null}
                href={`/courses/${row.courseId}`}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-3 py-6">
            {hasNextPage ? (
              <>
                <div ref={loadMoreRef} className="h-1 w-full max-w-md" aria-hidden />
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={isFetchingNext}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-60"
                >
                  {isFetchingNext ? (
                    <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                  ) : null}
                  Load more
                </button>
              </>
            ) : (
              <p className="text-xs text-slate-500">All matching courses are loaded.</p>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
