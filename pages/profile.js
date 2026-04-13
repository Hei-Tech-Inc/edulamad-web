import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'
import StudentStudyQuickLinks from '../components/StudentStudyQuickLinks'
import { useStudentProfile } from '@/hooks/students/useStudentProfile'
import { useStudentStreak, useStudentXp } from '@/hooks/dashboard/useDashboardOverview'
import { useProfileStudyLabels } from '@/hooks/institutions/useProfileStudyLabels'
import { STUDENT_CATEGORIES } from '@/api/types/student-profile.types'
import { getCurrentAcademicYearLabel } from '@/lib/onboarding/academic-years'

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

  return (
    <div className="space-y-5">
      <StudentStudyQuickLinks />

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">My profile</h2>
        {profileQ.isLoading ? <p className="mt-3 text-sm text-slate-500">Loading profile...</p> : null}
        {profileQ.isError ? (
          <p className="mt-3 text-sm text-rose-700">Could not load profile yet. Complete onboarding first.</p>
        ) : null}
        {p ? (
          <>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {p.indexNumber ? (
                <ProfileField label="Index number">{p.indexNumber}</ProfileField>
              ) : null}
              <ProfileField label="University">
                {labels.labelsLoading && !labels.universityName ? (
                  <span className="text-slate-500">Loading…</span>
                ) : (
                  labels.universityName ?? '—'
                )}
              </ProfileField>
              <ProfileField label="College / faculty">
                {labels.labelsLoading && !labels.collegeName ? (
                  <span className="text-slate-500">Loading…</span>
                ) : (
                  labels.collegeName ?? '—'
                )}
              </ProfileField>
              <ProfileField label="Department">
                {labels.labelsLoading && !labels.departmentName ? (
                  <span className="text-slate-500">Loading…</span>
                ) : (
                  labels.departmentName ?? '—'
                )}
              </ProfileField>
              <ProfileField label="Student type">
                {studentTypeLabel(p.studentCategory, p.otherStudentCategory)}
              </ProfileField>
              <ProfileField label="Academic year">{academicYear}</ProfileField>
              <ProfileField label="Level">{p.levelData}</ProfileField>
              <ProfileField label="Semester">{p.semesterData}</ProfileField>
            </dl>
            <details className="mt-4 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
              <summary className="cursor-pointer font-medium text-slate-700">Technical IDs</summary>
              <p className="mt-2 font-mono text-[11px] leading-relaxed">
                University ID: {p.universityId}
                <br />
                Department ID: {p.deptId}
              </p>
            </details>
          </>
        ) : null}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
        <div className="mt-5 flex flex-wrap gap-3">
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
