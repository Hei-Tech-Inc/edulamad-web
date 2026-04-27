import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../components/ProtectedRoute'
import Layout from '../../components/Layout'
import StudentStudyQuickLinks from '../../components/StudentStudyQuickLinks'
import { loadQuizBookmarks } from '@/lib/quiz/bookmarks'
import { useQuizHistory } from '@/hooks/quiz/useQuizHistory'
import { formatDuration, formatScore, formatTimeAgo } from '@/lib/utils/format'

export default function QuizHistoryPage() {
  return (
    <ProtectedRoute>
      <Layout title="Quiz History">
        <QuizHistoryContent />
      </Layout>
    </ProtectedRoute>
  )
}

function QuizHistoryContent() {
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState([])
  const [page, setPage] = useState(1)
  const historyQ = useQuizHistory({ page, limit: 12 })

  useEffect(() => {
    const refresh = () => setBookmarks(loadQuizBookmarks())
    refresh()
    const onStorage = (e) => {
      if (e.key === 'edulamad.quiz.bookmarks.v1' || e.key === null) refresh()
    }
    window.addEventListener('storage', onStorage)
    router.events.on('routeChangeComplete', refresh)
    const onVis = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('storage', onStorage)
      router.events.off('routeChangeComplete', refresh)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [router.events])

  return (
    <div className="space-y-5">
      <StudentStudyQuickLinks />

      <section id="saved-quizzes" className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Saved quizzes</h1>
        <p className="mt-2 text-sm text-slate-600">
          Bookmarks are stored in this browser only. If they disappear, check that you are on the same device and
          browser profile, and that private browsing or “clear site data” was not used.
        </p>
        {bookmarks.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Nothing saved yet. In practice or quiz mode, use <strong className="font-semibold">Save for later</strong>{' '}
            to pin the current session here.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {bookmarks.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{b.title}</p>
                  <p className="text-xs text-slate-500">Saved {new Date(b.savedAt).toLocaleString()}</p>
                </div>
                <Link href={b.href} className="text-sm font-semibold text-orange-700 hover:text-orange-800">
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Past quiz attempts</h2>
        <p className="mt-2 text-sm text-slate-600">Every completed quiz shows score, duration, and recency here.</p>
        {historyQ.isLoading ? (
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={`quiz-history-skeleton-${idx}`} className="h-20 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : historyQ.isError ? (
          <p className="mt-4 text-sm text-rose-700">Quiz history is unavailable right now. Try again shortly.</p>
        ) : historyQ.data?.items?.length ? (
          <>
            <ul className="mt-4 space-y-2">
              {historyQ.data.items.map((attempt) => (
                <li key={attempt.id} className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{attempt.courseName}</p>
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">
                      {formatScore(attempt.score, attempt.totalQuestions)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {formatTimeAgo(attempt.completedAt || attempt.startedAt)} · {formatDuration(attempt.durationSeconds)}
                  </p>
                  <div className="mt-2">
                    <Link
                      href={`/quiz/new?courseId=${encodeURIComponent(attempt.courseId)}`}
                      className="text-xs font-semibold text-orange-700 hover:text-orange-800"
                    >
                      Retry this course
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-slate-600">Page {page}</span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!historyQ.data.hasMore}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-slate-600">No quiz attempts yet.</p>
            <Link href="/quiz/new" className="mt-2 inline-flex text-sm font-medium text-orange-700 hover:text-orange-800">
              Start a new quiz
            </Link>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Discover quizzes</h2>
        <p className="mt-2 text-sm text-slate-600">
          Need new practice options? Browse suggestions from your enrolled courses.
        </p>
        <div className="mt-4">
          <Link href="/quiz/discover" className="text-sm font-medium text-orange-700 hover:text-orange-800">
            Open quiz discovery
          </Link>
        </div>
      </section>
    </div>
  )
}
