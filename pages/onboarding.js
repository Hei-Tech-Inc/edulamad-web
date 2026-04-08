import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'
import EntityCombobox from '../components/forms/EntityCombobox'
import {
  useCollegeSearch,
  useCourseSearch,
  useDepartmentSearch,
  useUniversitySearch,
} from '@/hooks/institutions/useInstitutionsCatalog'
import { useStudentProfile, useUpsertStudentProfile } from '@/hooks/students/useStudentProfile'
import { useAuthStore } from '@/stores/auth.store'

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <Layout title="Onboarding">
        <OnboardingInner />
      </Layout>
    </ProtectedRoute>
  )
}

function OnboardingInner() {
  const router = useRouter()
  const profileQ = useStudentProfile()
  const upsertM = useUpsertStudentProfile()
  const [step, setStep] = useState(1)
  const [indexNumber, setIndexNumber] = useState('')
  const [program, setProgram] = useState('')
  const [levelData, setLevelData] = useState(300)
  const [semesterData, setSemesterData] = useState(1)
  const [universitySearch, setUniversitySearch] = useState('')
  const [collegeSearch, setCollegeSearch] = useState('')
  const [departmentSearch, setDepartmentSearch] = useState('')
  const [university, setUniversity] = useState(null)
  const [college, setCollege] = useState(null)
  const [department, setDepartment] = useState(null)
  const setOnboardingNotice = useAuthStore((s) => s.setOnboardingNotice)

  const universitiesQ = useUniversitySearch(universitySearch, true)
  const collegesQ = useCollegeSearch(university?.id || null, collegeSearch, true)
  const departmentsQ = useDepartmentSearch(college?.id || null, departmentSearch, true)
  const coursesQ = useCourseSearch(department?.id || null, program, true)

  const isComplete = Boolean(
    profileQ.data?.universityId &&
      profileQ.data?.deptId &&
      profileQ.data?.indexNumber &&
      profileQ.data?.studentCategory,
  )

  const canContinueStep1 = Boolean(university?.id)
  const canContinueStep2 = Boolean(college?.id && department?.id)
  const canContinueStep3 = Boolean(program.trim() && indexNumber.trim())

  const selectedCourse = useMemo(() => {
    const list = coursesQ.data || []
    return list.find((item) => item.name.toLowerCase() === program.trim().toLowerCase()) || null
  }, [coursesQ.data, program])

  const onSkip = async () => {
    setOnboardingNotice('Profile setup skipped. Complete onboarding anytime from dashboard.')
    await router.replace('/dashboard')
  }

  const onSubmit = async (evt) => {
    evt.preventDefault()
    if (!university || !department) return
    await upsertM.mutateAsync({
      indexNumber: indexNumber.trim(),
      studentCategory: 'other',
      otherStudentCategory: program.trim(),
      universityId: university.id,
      deptId: department.id,
      levelData,
      semesterData,
      avatarKey: undefined,
    })
    setOnboardingNotice(null)
    await router.replace('/dashboard')
  }

  if (isComplete) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/80">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Profile already complete</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Your onboarding details are already saved.
        </p>
        <button
          type="button"
          className="mt-4 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          onClick={() => void router.replace('/dashboard')}
        >
          Continue to dashboard
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-neutral-800 dark:bg-neutral-950/80">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Complete your profile</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          This is optional for now. You can skip and finish later.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-200">
            Step {step} of 3
          </span>
          <button
            type="button"
            onClick={() => void onSkip()}
            className="rounded-full px-3 py-1 text-sm font-medium text-orange-600 transition hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-950/20"
          >
            Skip for now
          </button>
        </div>
      </div>

      {step === 1 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-neutral-800 dark:bg-neutral-950/80">
          <EntityCombobox
            id="onb-university"
            label="Institution"
            placeholder="Search institution"
            value={university}
            search={universitySearch}
            onSearchChange={setUniversitySearch}
            onSelect={(item) => {
              setUniversity(item)
              setCollege(null)
              setDepartment(null)
              setCollegeSearch('')
              setDepartmentSearch('')
            }}
            options={universitiesQ.data || []}
            loading={universitiesQ.isLoading}
          />
          <div className="mt-6">
            <button
              type="button"
              disabled={!canContinueStep1}
              className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-neutral-800 dark:bg-neutral-950/80 md:grid-cols-2">
          <EntityCombobox
            id="onb-college"
            label="College / Faculty"
            placeholder="Search college"
            value={college}
            search={collegeSearch}
            onSearchChange={setCollegeSearch}
            onSelect={(item) => {
              setCollege(item)
              setDepartment(null)
              setDepartmentSearch('')
            }}
            options={collegesQ.data || []}
            loading={collegesQ.isLoading}
            disabled={!university}
          />
          <EntityCombobox
            id="onb-department"
            label="Department"
            placeholder="Search department"
            value={department}
            search={departmentSearch}
            onSearchChange={setDepartmentSearch}
            onSelect={setDepartment}
            options={departmentsQ.data || []}
            loading={departmentsQ.isLoading}
            disabled={!college}
          />
          <div className="md:col-span-2 mt-1 flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-neutral-700 dark:text-slate-200 dark:hover:bg-neutral-900"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              type="button"
              disabled={!canContinueStep2}
              className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setStep(3)}
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-neutral-800 dark:bg-neutral-950/80">
          <EntityCombobox
            id="onb-program"
            label="Program of study / course"
            placeholder="Search program or course"
            value={selectedCourse}
            search={program}
            onSearchChange={setProgram}
            onSelect={(item) => setProgram(item.name)}
            options={coursesQ.data || []}
            loading={coursesQ.isLoading}
            disabled={!department}
          />
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Index number</span>
              <input
                value={indexNumber}
                onChange={(e) => setIndexNumber(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-orange-700 dark:focus:ring-orange-900/40"
                placeholder="UEB3211124"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Level</span>
              <input
                type="number"
                value={levelData}
                onChange={(e) => setLevelData(Number(e.target.value) || 0)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-orange-700 dark:focus:ring-orange-900/40"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Semester</span>
              <input
                type="number"
                value={semesterData}
                onChange={(e) => setSemesterData(Number(e.target.value) || 0)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-orange-700 dark:focus:ring-orange-900/40"
              />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-neutral-700 dark:text-slate-200 dark:hover:bg-neutral-900"
              onClick={() => setStep(2)}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!canContinueStep3 || upsertM.isPending}
              className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {upsertM.isPending ? 'Saving…' : 'Finish onboarding'}
            </button>
          </div>
        </div>
      ) : null}
    </form>
  )
}
