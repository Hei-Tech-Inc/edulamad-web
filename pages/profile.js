import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'
import StudentStudyQuickLinks from '../components/StudentStudyQuickLinks'
import { useStudentProfile } from '@/hooks/students/useStudentProfile'
import { useStudentStreak, useStudentXp } from '@/hooks/dashboard/useDashboardOverview'
import { useProfileStudyLabels } from '@/hooks/institutions/useProfileStudyLabels'
import { STUDENT_CATEGORIES } from '@/api/types/student-profile.types'
import { getCurrentAcademicYearLabel } from '@/lib/onboarding/academic-years'
import { LottieMotion } from '@/components/ui/LottieMotion'

function studentTypeLabel(studentCategory, otherStudentCategory) {
  if (studentCategory === 'other' && otherStudentCategory?.trim()) {
    return otherStudentCategory.trim()
  }
  const row = STUDENT_CATEGORIES.find((c) => c.value === studentCategory)
  return row?.label ?? studentCategory
}

function ProfileField({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">{children}</dd>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Layout title="Profile">
        <ProfileContent />
      </Layout>
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const profileQ = useStudentProfile()
  const streakQ = useStudentStreak()
  const xpQ = useStudentXp()
  const p = profileQ.data

  const labels = useProfileStudyLabels(p?.universityId, p?.deptId)

  const academicYear = getCurrentAcademicYearLabel()
  const profileItems = [
    p?.indexNumber ? { label: 'Index number', value: p.indexNumber } : null,
    {
      label: 'University',
      value:
        labels.labelsLoading && !labels.universityName ? (
          <span className="text-slate-500">Loading…</span>
        ) : (
          labels.universityName ?? '—'
        ),
    },
    {
      label: 'College / faculty',
      value:
        labels.labelsLoading && !labels.collegeName ? (
          <span className="text-slate-500">Loading…</span>
        ) : (
          labels.collegeName ?? '—'
        ),
    },
    {
      label: 'Department',
      value:
        labels.labelsLoading && !labels.departmentName ? (
          <span className="text-slate-500">Loading…</span>
        ) : (
          labels.departmentName ?? '—'
        ),
    },
    { label: 'Student type', value: studentTypeLabel(p?.studentCategory, p?.otherStudentCategory) },
    { label: 'Academic year', value: academicYear },
    { label: 'Level', value: p?.levelData ?? '—' },
    { label: 'Semester', value: p?.semesterData ?? '—' },
  ].filter(Boolean)

  return (
    <div className="space-y-5">
      <StudentStudyQuickLinks />

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">My profile</h2>
          <LottieMotion
            src="https://assets-v2.lottiefiles.com/a/f34397be-1180-11ee-a4a0-9f01bce8ffcd/8QFWyMCWKA.lottie"
            className="h-12 w-12 shrink-0"
          />
        </div>
        {profileQ.isLoading ? <p className="mt-3 text-sm text-slate-500">Loading profile...</p> : null}
        {profileQ.isError ? (
          <p className="mt-3 text-sm text-rose-700">Could not load profile yet. Complete onboarding first.</p>
        ) : null}
        {p ? (
          <>
            <div className="scroll-row mt-4 snap-x snap-mandatory sm:hidden">
              {profileItems.map((item) => (
                <div
                  key={item.label}
                  className="min-w-[230px] snap-start rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
            <dl className="mt-4 hidden gap-4 sm:grid sm:grid-cols-2">
              {profileItems.map((item) => (
                <ProfileField key={item.label} label={item.label}>
                  {item.value}
                </ProfileField>
              ))}
            </dl>
            <details className="mt-4 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
              <summary className="cursor-pointer font-medium text-slate-700">Technical IDs</summary>
              <p className="mt-2 break-all font-mono text-[11px] leading-relaxed">
                University ID: {p.universityId}
                <br />
                Department ID: {p.deptId}
              </p>
            </details>
          </>
        ) : null}
        <div className="mt-5 hidden gap-3 sm:grid sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Streak</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {typeof streakQ.data === 'number' ? `${streakQ.data} days` : '—'}
            </p>
            <p className="mt-1 text-xs text-slate-500">Also shown on Home (dashboard).</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">XP</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{xpQ.data ?? '—'}</p>
            <p className="mt-1 text-xs text-slate-500">Leaderboard: tab bar → Leaderboard.</p>
          </div>
        </div>
        <div className="scroll-row mt-5 snap-x snap-mandatory sm:hidden">
          <div className="min-w-[240px] snap-start rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Streak</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {typeof streakQ.data === 'number' ? `${streakQ.data} days` : '—'}
            </p>
            <p className="mt-1 text-xs text-slate-500">Also shown on Home (dashboard).</p>
          </div>
          <div className="min-w-[240px] snap-start rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">XP</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{xpQ.data ?? '—'}</p>
            <p className="mt-1 text-xs text-slate-500">Leaderboard: tab bar → Leaderboard.</p>
          </div>
          <div className="min-w-[180px] snap-start rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2 sm:hidden">
            <p className="text-[11px] font-medium text-sky-800">Keep scrolling</p>
            <LottieMotion
              src="https://assets-v2.lottiefiles.com/a/9014bb08-1150-11ee-b768-6bee1eda41dd/yLzmc7HLnr.lottie"
              className="h-10 w-full"
            />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/activity"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Activity tracker
          </Link>
          <Link
            href="/quiz/history"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Quiz history
          </Link>
          <Link
            href="/quiz/discover"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Discover quizzes
          </Link>
          <Link href="/settings/account" className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white">
            Account settings
          </Link>
          <Link
            href="/profile/credits"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Credits
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Home dashboard
          </Link>
        </div>
      </section>
    </div>
  )
}
