import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import CourseQuizPractice from '../../components/practice/CourseQuizPractice'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthStore } from '@/stores/auth.store'
import { decodeQuizPayload, pickQuizSharePresentation } from '@/lib/quiz/decode-quiz-payload'
import { Clock, GraduationCap, UserRound } from 'lucide-react'

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
  const router = useRouter()
  const next =
    typeof window !== 'undefined'
      ? encodeURIComponent(`${window.location.pathname}${window.location.search}`)
      : encodeURIComponent('/quiz')

  const payload = router.isReady ? decodeQuizPayload(router.query.id) : null
  const meta = pickQuizSharePresentation(payload)
  const headline = meta.sharedByName
    ? `${meta.sharedByName} shared a quiz with you`
    : 'Someone shared a quiz with you'

  const sessionMeta = [
    meta.year ? `Academic year ${meta.year}/${Number(meta.year) + 1}` : null,
    meta.level ? `Level ${meta.level}` : null,
    meta.sourceLabel || null,
  ].filter(Boolean)

  const timerCopy =
    meta.timerMins != null && Number.isFinite(meta.timerMins) && meta.timerMins > 0
      ? `${meta.timerMins}-minute timed quiz`
      : 'Untimed practice'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.25)]">
          <div className="border-b border-orange-100 bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-100">Shared quiz</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight">{headline}</h1>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-left">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-800">
                <GraduationCap className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Course</p>
                <p className="mt-0.5 text-base font-semibold leading-snug text-slate-900">
                  {(meta.courseName || 'Past questions').trim() || 'Past questions'}
                </p>
                {sessionMeta.length ? (
                  <p className="mt-1 text-sm text-slate-600">{sessionMeta.join(' · ')}</p>
                ) : null}
              </div>
            </div>

            {meta.sharedByName ? (
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-left shadow-sm">
                <UserRound className="h-9 w-9 shrink-0 text-slate-400" aria-hidden />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Shared by</p>
                  <p className="truncate text-sm font-medium text-slate-900">{meta.sharedByName}</p>
                </div>
              </div>
            ) : null}

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-left text-sm text-slate-700">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Clock className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                <span>{timerCopy}</span>
              </p>
              {meta.questionCount ? (
                <p className="mt-2 text-xs text-slate-600">{meta.questionCount} questions in this set.</p>
              ) : (
                <p className="mt-2 text-xs text-slate-600">Sign in to load the same question set from this link.</p>
              )}
            </div>

            <p className="text-center text-sm text-slate-600">
              Sign in with your Edulamad account to open this quiz. You&apos;ll choose when to start after you sign in.
            </p>

            <div className="flex flex-col gap-2">
              <Link
                href={`/login?next=${next}`}
                className="rounded-xl bg-orange-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-orange-700"
              >
                Sign in
              </Link>
              <Link
                href={`/register?next=${next}`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Create free account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
