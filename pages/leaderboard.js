import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import StudentStudyQuickLinks from '../components/StudentStudyQuickLinks'

export default function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <Layout title="Leaderboard">
        <LeaderboardContent />
      </Layout>
    </ProtectedRoute>
  )
}

function LeaderboardContent() {
  const leaderboardQ = useQuery({
    queryKey: ['gamification', 'leaderboard'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get(API.gamification.leaderboard, { signal })
      return Array.isArray(data) ? data : []
    },
  })

  const rows = leaderboardQ.data || []
  const hasRows = rows.length > 0

  return (
    <div className="space-y-5">
      <StudentStudyQuickLinks />
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Department leaderboard</h2>
        <p className="mt-1 text-sm text-slate-600">
          Rankings update as you complete quizzes. Your streak and XP also show on the home dashboard.
        </p>
        {leaderboardQ.isLoading ? <p className="mt-3 text-sm text-slate-500">Loading...</p> : null}
        {leaderboardQ.isError ? (
          <p className="mt-3 text-sm text-rose-700">Could not load leaderboard. Try again in a moment.</p>
        ) : null}
        {!leaderboardQ.isLoading && !leaderboardQ.isError && !hasRows ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
            <p className="text-sm font-medium text-slate-800">No leaderboard rows yet</p>
            <p className="mt-2 text-sm text-slate-600">
              Complete a few quizzes to appear here, or check back once your department has more activity.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/quiz/new"
                className="inline-flex rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              >
                Start a quiz
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                View streak on dashboard
              </Link>
            </div>
          </div>
        ) : null}
        {!leaderboardQ.isLoading && !leaderboardQ.isError && hasRows ? (
          <ul className="mt-4 space-y-2">
            {rows.slice(0, 10).map((row, idx) => (
              <li
                key={String(row.id || idx)}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
              >
                <span className="text-sm text-slate-800">
                  {idx + 1}. {row.name || row.userName || 'Student'}
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {row.score ?? row.points ?? row.xp ?? 0}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  )
}
