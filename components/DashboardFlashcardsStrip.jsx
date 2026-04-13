import Link from 'next/link'
import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Layers } from 'lucide-react'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { useFlashcardDueOverview } from '@/hooks/flashcards/useFlashcards'
import { useStudentProfile } from '@/hooks/students/useStudentProfile'
import { usePersonalisationStore } from '@/stores/personalisation.store'

const YEAR = String(new Date().getFullYear())

function useHubCourseIds() {
  const profileQ = useStudentProfile()
  const persisted = usePersonalisationStore((s) => s.currentSemesterCourseIds)
  const level =
    typeof profileQ.data?.levelData === 'number' && Number.isFinite(profileQ.data.levelData)
      ? Math.trunc(profileQ.data.levelData)
      : 300

  const q = useInfiniteQuery({
    queryKey: ['dashboard', 'my-courses', 'flash', YEAR, level],
    enabled: Boolean(profileQ.data),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const { data } = await apiClient.get(API.students.meCourses, {
        signal,
        params: {
          page: pageParam,
          limit: 24,
          year: YEAR,
          level,
          sort: 'title_asc',
        },
      })
      return data
    },
    getNextPageParam: (last) => (last.meta?.hasMore ? last.meta.page + 1 : undefined),
  })

  return useMemo(() => {
    const fromApi = q.data?.pages?.flatMap((p) => (p.data ?? []).map((c) => c.courseId)) ?? []
    return [...new Set([...persisted, ...fromApi].filter(Boolean))]
  }, [q.data, persisted])
}

export default function DashboardFlashcardsStrip() {
  const courseIds = useHubCourseIds()
  const dueQ = useFlashcardDueOverview(courseIds)

  if (!courseIds.length) return null

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-200">
            <Layers className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-100">Flashcards</p>
            <p className="text-xs text-slate-500">
              {dueQ.isLoading
                ? 'Checking due cards…'
                : `${dueQ.data?.totalDue ?? 0} card${(dueQ.data?.totalDue ?? 0) === 1 ? '' : 's'} due across your courses`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {dueQ.data?.topDeck ? (
            <Link
              href={`/flashcards/decks/${dueQ.data.topDeck.deckId}?courseId=${encodeURIComponent(
                dueQ.data.topDeck.courseId,
              )}`}
              className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-700"
            >
              Start reviewing
            </Link>
          ) : null}
          <Link
            href="/flashcards"
            className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-white/10"
          >
            Open hub
          </Link>
        </div>
      </div>
    </section>
  )
}
