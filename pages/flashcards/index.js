import Link from 'next/link'
import Head from 'next/head'
import ProtectedRoute from '../../components/ProtectedRoute'
import Layout from '../../components/Layout'
import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { useFlashcardDecksForCourse, useFlashcardDueOverview, useFlashcardProgress } from '@/hooks/flashcards/useFlashcards'
import { useStudentProfile } from '@/hooks/students/useStudentProfile'
import { usePersonalisationStore } from '@/stores/personalisation.store'
import { Layers } from 'lucide-react'

const YEAR = String(new Date().getFullYear())

export default function FlashcardsHubPage() {
  return (
    <ProtectedRoute>
      <Layout title="Flashcards">
        <Head>
          <title>Flashcards</title>
        </Head>
        <FlashcardsHubInner />
      </Layout>
    </ProtectedRoute>
  )
}

function useMyCourseIds(profile) {
  const raw = profile?.levelData
  const level = typeof raw === 'number' && Number.isFinite(raw) ? Math.trunc(raw) : 300
  return useInfiniteQuery({
    queryKey: ['students', 'my-courses', 'flashcards-hub', YEAR, level],
    enabled: Boolean(profile),
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
}

function DeckRow({ deck, courseId }) {
  const progQ = useFlashcardProgress(deck._id, Boolean(deck._id))
  const p = progQ.data
  const pct =
    p && p.totalCards > 0 ? Math.round(((p.masteredCards ?? 0) / p.totalCards) * 100) : 0
  return (
    <li className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{deck.title}</p>
          <p className="text-xs text-slate-500">
            {deck.cardCount ?? 0} cards
            {p ? ` · ${p.dueCards ?? 0} due` : ''}
          </p>
          {p ? (
            <div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/flashcards/decks/${deck._id}?courseId=${encodeURIComponent(courseId)}`}
            className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700"
          >
            Study
          </Link>
        </div>
      </div>
    </li>
  )
}

function CourseBlock({ courseId, code, name }) {
  const decksQ = useFlashcardDecksForCourse(courseId, Boolean(courseId))
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Course</p>
          <p className="text-base font-semibold text-slate-900">
            {code ? `${code} · ` : ''}
            {name}
          </p>
        </div>
        <Link
          href={`/courses/${courseId}`}
          className="text-xs font-semibold text-orange-700 hover:underline"
        >
          Course home
        </Link>
      </div>
      {decksQ.isLoading ? <p className="text-sm text-slate-500">Loading decks…</p> : null}
      {decksQ.isError ? (
        <p className="text-sm text-rose-700">Could not load decks for this course.</p>
      ) : null}
      {decksQ.data?.length ? (
        <ul className="space-y-2">
          {decksQ.data.map((d) => (
            <DeckRow key={d._id} deck={d} courseId={courseId} />
          ))}
        </ul>
      ) : null}
      {!decksQ.isLoading && !decksQ.data?.length ? (
        <p className="text-sm text-slate-600">
          No published decks yet. Teaching assistants upload decks from the content tools when they are
          ready.
        </p>
      ) : null}
    </section>
  )
}

function FlashcardsHubInner() {
  const profileQ = useStudentProfile()
  const persisted = usePersonalisationStore((s) => s.currentSemesterCourseIds)
  const myCoursesQ = useMyCourseIds(profileQ.data ?? null)

  const courseIds = useMemo(() => {
    const fromApi =
      myCoursesQ.data?.pages?.flatMap((p) => (p.data ?? []).map((c) => c.courseId)) ?? []
    const merged = [...new Set([...persisted, ...fromApi].filter(Boolean))]
    return merged
  }, [myCoursesQ.data, persisted])

  const coursesMeta = useMemo(() => {
    const map = new Map()
    for (const page of myCoursesQ.data?.pages ?? []) {
      for (const row of page.data ?? []) {
        map.set(row.courseId, { code: row.code, name: row.name })
      }
    }
    return map
  }, [myCoursesQ.data])

  const dueOverview = useFlashcardDueOverview(courseIds)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-900">
            <Layers className="h-3.5 w-3.5" aria-hidden />
            Spaced repetition
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Flashcards</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review decks for your courses. Ratings update your next review date (SM‑2).
          </p>
        </div>
      </header>

      {dueOverview.data?.totalDue > 0 ? (
        <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-4">
          <p className="text-lg font-semibold text-slate-900">
            {dueOverview.data.totalDue} card{dueOverview.data.totalDue === 1 ? '' : 's'} due today
          </p>
          {dueOverview.data.topDeck ? (
            <Link
              href={`/flashcards/decks/${dueOverview.data.topDeck.deckId}?courseId=${encodeURIComponent(
                dueOverview.data.topDeck.courseId,
              )}`}
              className="mt-2 inline-flex rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Start reviewing → {dueOverview.data.topDeck.title}
            </Link>
          ) : (
            <p className="mt-2 text-sm text-slate-700">Open a course below to start.</p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700">
          {dueOverview.isLoading
            ? 'Calculating due cards…'
            : 'No due cards right now — pick a deck to get ahead.'}
        </div>
      )}

      <div className="space-y-4">
        {courseIds.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
            <p>
              Enrol in courses from <Link href="/courses">My Courses</Link> to see flashcard decks
              here.
            </p>
          </div>
        ) : (
          courseIds.map((id) => (
            <CourseBlock
              key={id}
              courseId={id}
              code={coursesMeta.get(id)?.code}
              name={coursesMeta.get(id)?.name ?? 'Course'}
            />
          ))
        )}
      </div>
    </div>
  )
}
