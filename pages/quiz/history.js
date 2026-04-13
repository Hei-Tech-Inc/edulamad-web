import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../components/ProtectedRoute'
import Layout from '../../components/Layout'
import StudentStudyQuickLinks from '../../components/StudentStudyQuickLinks'
import { loadQuizBookmarks } from '@/lib/quiz/bookmarks'

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
        <p className="mt-2 text-sm text-slate-600">
          A full attempt history will appear here as sessions are synced to your account. For now, use{' '}
          <strong className="font-semibold">Saved quizzes</strong> above for quick return links.
        </p>
        <div className="mt-4">
          <Link href="/quiz/new" className="text-sm font-medium text-orange-700 hover:text-orange-800">
            Start a new quiz
          </Link>
        </div>
      </section>
    </div>
  )
}
