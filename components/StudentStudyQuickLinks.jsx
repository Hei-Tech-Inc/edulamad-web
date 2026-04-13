import Link from 'next/link'
import { Bookmark, Flame, History, Layers, ListOrdered, Presentation, Trophy } from 'lucide-react'
import { useStudentStreak } from '@/hooks/dashboard/useDashboardOverview'

/**
 * Persistent entry points for core study flows (quizzes, history, slides path, streak).
 * Use on courses, profile, or dashboard so users are never more than one tap from practice.
 */
export default function StudentStudyQuickLinks({ variant = 'light' }) {
  const streakQ = useStudentStreak()
  const streakVal = streakQ.data
  const isDark = variant === 'dark'

  const wrap = isDark
    ? 'rounded-2xl border border-white/10 bg-white/[0.04] p-4'
    : 'rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm'
  const titleCls = isDark ? 'text-sm font-semibold text-slate-100' : 'text-sm font-semibold text-slate-900'
  const descCls = isDark ? 'text-xs text-slate-500' : 'text-xs text-slate-500'
  const cardBase = isDark
    ? 'rounded-xl border border-white/10 bg-[#0b101a]/80 px-3 py-2.5 transition hover:border-orange-500/40 hover:bg-white/[0.06]'
    : 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition hover:border-orange-300 hover:bg-orange-50/50'
  const labelCls = isDark ? 'text-sm font-medium text-slate-100' : 'text-sm font-medium text-slate-900'
  const subCls = isDark ? 'text-[11px] text-slate-500' : 'text-[11px] text-slate-500'

  return (
    <section className={wrap} aria-label="Study shortcuts">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className={titleCls}>Find quizzes &amp; study tools</h2>
          <p className={`mt-0.5 ${descCls}`}>
            Slides live under each course: My Courses → pick a course → Slides (or Offerings).
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isDark ? 'bg-orange-500/15 text-orange-200' : 'bg-orange-100 text-orange-900'
          }`}
        >
          <Flame className="h-3.5 w-3.5" aria-hidden />
          Streak: {typeof streakVal === 'number' ? `${streakVal} day${streakVal === 1 ? '' : 's'}` : '—'}
        </div>
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <li>
          <Link href="/flashcards" className={`flex h-full flex-col gap-0.5 ${cardBase}`}>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-orange-600" aria-hidden />
              <span className={labelCls}>Flashcards</span>
            </span>
            <span className={subCls}>Spaced repetition decks</span>
          </Link>
        </li>
        <li>
          <Link href="/quiz/new" className={`flex h-full flex-col gap-0.5 ${cardBase}`}>
            <span className="inline-flex items-center gap-1.5">
              <ListOrdered className="h-4 w-4 text-orange-600" aria-hidden />
              <span className={labelCls}>Start a quiz</span>
            </span>
            <span className={subCls}>New timed session</span>
          </Link>
        </li>
        <li>
          <Link href="/quiz/history" className={`flex h-full flex-col gap-0.5 ${cardBase}`}>
            <span className="inline-flex items-center gap-1.5">
              <History className="h-4 w-4 text-orange-600" aria-hidden />
              <span className={labelCls}>Quiz history</span>
            </span>
            <span className={subCls}>Past attempts</span>
          </Link>
        </li>
        <li>
          <Link href="/quiz/history#saved-quizzes" className={`flex h-full flex-col gap-0.5 ${cardBase}`}>
            <span className="inline-flex items-center gap-1.5">
              <Bookmark className="h-4 w-4 text-orange-600" aria-hidden />
              <span className={labelCls}>Saved quizzes</span>
            </span>
            <span className={subCls}>Stored on this device</span>
          </Link>
        </li>
        <li>
          <Link href="/leaderboard" className={`flex h-full flex-col gap-0.5 ${cardBase}`}>
            <span className="inline-flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-orange-600" aria-hidden />
              <span className={labelCls}>Leaderboard</span>
            </span>
            <span className={subCls}>Department rankings</span>
          </Link>
        </li>
      </ul>
      <p className={`mt-3 flex flex-wrap items-center gap-1.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        <Presentation className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
        <span>
          <strong className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Course slides:</strong>{' '}
          open{' '}
          <Link
            href="/courses"
            className={`font-medium underline-offset-2 hover:underline ${isDark ? 'text-orange-300 hover:text-orange-200' : 'text-orange-700 hover:text-orange-800'}`}
          >
            My Courses
          </Link>
          , choose a course, then <strong className="font-semibold">Slides</strong> (under offerings).
        </span>
      </p>
    </section>
  )
}
