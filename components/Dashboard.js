import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import {
  useCollegeSearch,
  useCourseSearch,
  useDepartmentSearch,
  useUniversitySearch,
} from '@/hooks/institutions/useInstitutionsCatalog'
import { useCourseQuestions } from '@/hooks/questions/useCourseQuestions'
import {
  useAdminStats,
  useAnalyticsMe,
  useAuthMe,
  useMyNotifications,
  useStudentProfile,
  useStudentStreak,
  useStudentXp,
} from '@/hooks/dashboard/useDashboardOverview'
import EntityCombobox from './forms/EntityCombobox'
import { useAuthStore } from '@/stores/auth.store'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'Edulamad'
const panelClass =
  'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:border-neutral-800 dark:bg-neutral-950/80'

function SelectField({ label, value, onChange, options, disabled = false }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function byName(a, b) {
  return a.name.localeCompare(b.name)
}

export default function Dashboard() {
  const [activeOnly, setActiveOnly] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('2024')
  const [level, setLevel] = useState('300')
  const [type, setType] = useState('theory')
  const [institutionSearch, setInstitutionSearch] = useState('')
  const [collegeSearch, setCollegeSearch] = useState('')
  const [departmentSearch, setDepartmentSearch] = useState('')
  const [courseSearch, setCourseSearch] = useState('')
  const [universityId, setUniversityId] = useState('')
  const [collegeId, setCollegeId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [universityValue, setUniversityValue] = useState(null)
  const [collegeValue, setCollegeValue] = useState(null)
  const [departmentValue, setDepartmentValue] = useState(null)
  const [courseValue, setCourseValue] = useState(null)
  const onboardingNotice = useAuthStore((s) => s.onboardingNotice)
  const setOnboardingNotice = useAuthStore((s) => s.setOnboardingNotice)

  const universitiesQ = useUniversitySearch(institutionSearch, activeOnly)
  const collegesQ = useCollegeSearch(universityId || null, collegeSearch, activeOnly)
  const departmentsQ = useDepartmentSearch(collegeId || null, departmentSearch, activeOnly)
  const coursesQ = useCourseSearch(departmentId || null, courseSearch, activeOnly)
  const questionsQ = useCourseQuestions({
    courseId: courseId || null,
    year,
    level,
    type,
  })
  const authMeQ = useAuthMe()
  const profileQ = useStudentProfile()
  const streakQ = useStudentStreak()
  const xpQ = useStudentXp()
  const analyticsQ = useAnalyticsMe()
  const adminStatsQ = useAdminStats()
  const notificationsQ = useMyNotifications(5)
  const isOnboardingComplete = Boolean(
    profileQ.data?.universityId &&
      profileQ.data?.deptId &&
      profileQ.data?.indexNumber &&
      profileQ.data?.studentCategory,
  )

  useEffect(() => {
    setCollegeId('')
    setDepartmentId('')
    setCourseId('')
    setCollegeValue(null)
    setDepartmentValue(null)
    setCourseValue(null)
    setCollegeSearch('')
    setDepartmentSearch('')
    setCourseSearch('')
  }, [universityId])

  useEffect(() => {
    setDepartmentId('')
    setCourseId('')
    setDepartmentValue(null)
    setCourseValue(null)
    setDepartmentSearch('')
    setCourseSearch('')
  }, [collegeId])

  useEffect(() => {
    setCourseId('')
    setCourseValue(null)
    setCourseSearch('')
  }, [departmentId])

  const universities = useMemo(
    () => (universitiesQ.data || []).slice().sort(byName),
    [universitiesQ.data],
  )
  const colleges = useMemo(() => (collegesQ.data || []).slice().sort(byName), [collegesQ.data])
  const departments = useMemo(
    () => (departmentsQ.data || []).slice().sort(byName),
    [departmentsQ.data],
  )
  const courses = useMemo(() => (coursesQ.data || []).slice().sort(byName), [coursesQ.data])

  const courseResults = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return courses
    return courses.filter((course) => {
      const hay = `${course.name} ${course.code || ''}`.toLowerCase()
      return hay.includes(term)
    })
  }, [courses, search])

  const analyticsObject = analyticsQ.data || {}
  const questionsSolved =
    analyticsObject.questionsSolved ??
    analyticsObject.totalQuestionsSolved ??
    analyticsObject.solved ??
    null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {APP_NAME} dashboard
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          Browse institutions from the API and fetch past questions by course with required filters.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className={panelClass}>
          <p className="text-xs text-slate-500 dark:text-slate-400">Signed in user</p>
          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
            {authMeQ.data?.email || '—'}
          </p>
          {authMeQ.isError ? (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Could not load `/auth/me`. Session stays active.
            </p>
          ) : null}
        </div>
        <div className={panelClass}>
          <p className="text-xs text-slate-500 dark:text-slate-400">Student level</p>
          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
            {profileQ.data?.levelData ?? profileQ.data?.level ?? '—'}
          </p>
        </div>
        <div className={panelClass}>
          <p className="text-xs text-slate-500 dark:text-slate-400">Current streak</p>
          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
            {streakQ.data ?? '—'}
          </p>
        </div>
        <div className={panelClass}>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total XP</p>
          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
            {xpQ.data ?? '—'}
          </p>
        </div>
      </section>

      {!isOnboardingComplete || onboardingNotice ? (
        <section className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 shadow-[0_12px_30px_rgba(251,146,60,0.14)] dark:border-orange-900/70 dark:bg-orange-950/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-200">
                {onboardingNotice || 'Complete your profile to unlock all features.'}
              </p>
              <p className="mt-1 text-xs text-orange-700 dark:text-orange-300">
                Add institution and program details once; we’ll reuse them across the app.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/onboarding"
                className="rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700"
              >
                Complete profile
              </Link>
              {onboardingNotice ? (
                <button
                  type="button"
                  className="rounded-md border border-orange-400 px-3 py-2 text-sm text-orange-800 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-200 dark:hover:bg-orange-900/30"
                  onClick={() => setOnboardingNotice(null)}
                >
                  Dismiss
                </button>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className={panelClass}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Institution catalog
          </h3>
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
            />
            Active only
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <EntityCombobox
            id="dash-university"
            label="Institution"
            placeholder="Search institution"
            value={universityValue}
            search={institutionSearch}
            onSearchChange={setInstitutionSearch}
            onSelect={(item) => {
              setUniversityValue(item)
              setUniversityId(item.id)
            }}
            options={universities}
            loading={universitiesQ.isLoading}
          />
          <EntityCombobox
            id="dash-college"
            label="College / Faculty"
            placeholder="Search college"
            value={collegeValue}
            search={collegeSearch}
            onSearchChange={setCollegeSearch}
            onSelect={(item) => {
              setCollegeValue(item)
              setCollegeId(item.id)
            }}
            options={colleges}
            loading={collegesQ.isLoading}
            disabled={!universityId}
          />
          <EntityCombobox
            id="dash-department"
            label="Department"
            placeholder="Search department"
            value={departmentValue}
            search={departmentSearch}
            onSearchChange={setDepartmentSearch}
            onSelect={(item) => {
              setDepartmentValue(item)
              setDepartmentId(item.id)
            }}
            options={departments}
            loading={departmentsQ.isLoading}
            disabled={!collegeId}
          />
          <EntityCombobox
            id="dash-course"
            label="Course / Program"
            placeholder="Search course"
            value={courseValue}
            search={courseSearch}
            onSearchChange={setCourseSearch}
            onSelect={(item) => {
              setCourseValue(item)
              setCourseId(item.id)
            }}
            options={courses}
            loading={coursesQ.isLoading}
            disabled={!departmentId}
          />
        </div>

        <div className="mt-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by name or code"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-50"
            />
          </label>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {courseResults.length} course{courseResults.length === 1 ? '' : 's'} found
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className={panelClass}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Learning analytics</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>Questions solved: {questionsSolved ?? '—'}</p>
            <p>Profile loaded: {profileQ.isSuccess ? 'Yes' : 'No'}</p>
            <p>Analytics endpoint: {analyticsQ.isError ? 'Unavailable' : 'Connected'}</p>
          </div>
        </div>
        <div className={panelClass}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Admin stats</h3>
          {adminStatsQ.isError ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Not available for this user role.
            </p>
          ) : adminStatsQ.isLoading ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading admin stats…</p>
          ) : (
            <pre className="mt-3 max-h-40 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-700 dark:bg-neutral-900 dark:text-slate-300">
              {JSON.stringify(adminStatsQ.data || {}, null, 2)}
            </pre>
          )}
        </div>
      </section>

      <section className={panelClass}>
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-50">
          Past questions
        </h3>
        {!isOnboardingComplete ? (
          <div className="rounded-lg border border-orange-300 bg-orange-50 p-4 text-sm text-orange-900 dark:border-orange-900/70 dark:bg-orange-950/20 dark:text-orange-200">
            Complete onboarding to unlock past questions for your profile.
            <Link href="/onboarding" className="ml-2 font-semibold underline">
              Complete profile
            </Link>
          </div>
        ) : null}
        <div className={`grid gap-3 md:grid-cols-3 ${!isOnboardingComplete ? 'opacity-60 pointer-events-none' : ''}`}>
          <SelectField
            label="Year"
            value={year}
            onChange={setYear}
            options={['2025', '2024', '2023', '2022', '2021'].map((v) => ({
              value: v,
              label: v,
            }))}
          />
          <SelectField
            label="Level"
            value={level}
            onChange={setLevel}
            options={['100', '200', '300', '400', '500'].map((v) => ({
              value: v,
              label: `Level ${v}`,
            }))}
          />
          <SelectField
            label="Type"
            value={type}
            onChange={setType}
            options={[
              { value: 'theory', label: 'Theory' },
              { value: 'objective', label: 'Objective' },
              { value: 'practical', label: 'Practical' },
            ]}
          />
        </div>

        {!courseId ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Select a course to load questions.
          </p>
        ) : questionsQ.isLoading ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading questions…</p>
        ) : questionsQ.isError ? (
          <p className="mt-4 text-sm text-rose-500">
            Could not load questions with this filter set. Confirm `year`, `level`, and `type`.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-2 py-2">Question</th>
                  <th className="px-2 py-2">Type</th>
                  <th className="px-2 py-2">Year</th>
                  <th className="px-2 py-2">Level</th>
                </tr>
              </thead>
              <tbody>
                {(questionsQ.data || []).map((q) => (
                  <tr key={q.id} className="border-t border-slate-100 dark:border-neutral-800">
                    <td className="px-2 py-2 text-slate-900 dark:text-slate-100">{q.questionText}</td>
                    <td className="px-2 py-2 text-slate-600 dark:text-slate-300">{q.type || '—'}</td>
                    <td className="px-2 py-2 text-slate-600 dark:text-slate-300">{q.year || '—'}</td>
                    <td className="px-2 py-2 text-slate-600 dark:text-slate-300">{q.level || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {questionsQ.data?.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                No questions matched this course/filter combination.
              </p>
            ) : null}
          </div>
        )}
      </section>

      <section className={panelClass}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Recent notifications</h3>
        {notificationsQ.isLoading ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading notifications…</p>
        ) : notificationsQ.isError ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Notifications endpoint unavailable.
          </p>
        ) : notificationsQ.data?.length ? (
          <ul className="mt-3 space-y-2">
            {notificationsQ.data.map((note) => (
              <li
                key={note.id}
                className="rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-neutral-800"
              >
                <p className="text-slate-800 dark:text-slate-100">{note.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{note.createdAt || ''}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No notifications found.</p>
        )}
      </section>
    </div>
  )
}
