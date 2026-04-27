import Link from 'next/link'
import Layout from '../../components/Layout'
import CourseQuizPractice from '../../components/practice/CourseQuizPractice'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthStore } from '@/stores/auth.store'

export default function QuizSessionPage() {
  const { user, loading, initialized } = useAuth()
  const hasHydrated = useAuthStore((s) => s._hasHydrated)

  if (!initialized || loading || !hasHydrated) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">Loading quiz…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <QuizLoginPrompt />
  }

  return (
    <Layout title="Quiz">
      <QuizSessionInner />
    </Layout>
  )
}

function QuizSessionInner() {
  return <CourseQuizPractice />
}

function QuizLoginPrompt() {
  const next =
    typeof window !== 'undefined'
      ? encodeURIComponent(`${window.location.pathname}${window.location.search}`)
      : encodeURIComponent('/quiz')

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
          ⚡
        </div>
        <h1 className="text-xl font-bold text-slate-900">Someone shared a quiz with you</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to open this quiz and continue your practice.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={`/login?next=${next}`}
            className="rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Sign in to start quiz
          </Link>
          <Link
            href={`/register?next=${next}`}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Create free account
          </Link>
        </div>
      </div>
    </div>
  )
}
