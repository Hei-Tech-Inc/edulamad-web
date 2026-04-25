import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Building2, CheckCircle2, GraduationCap, MapPin, Sparkles } from 'lucide-react'
import ProtectedRoute from '../components/ProtectedRoute'
import EntityCombobox from '../components/forms/EntityCombobox'
import SectionTitle from '@/components/atoms/SectionTitle'
import SectionCard from '@/components/atoms/SectionCard'
import {
  useCollegeSearch,
  useCourseSearch,
  useDepartmentSearch,
  useUniversitySearch,
} from '@/hooks/institutions/useInstitutionsCatalog'
import { useStudentProfile, useUpsertStudentProfile } from '@/hooks/students/useStudentProfile'
import { useAuthStore } from '@/stores/auth.store'
import { AppApiError } from '@/lib/api-error'
import { isAbortLikeError } from '@/lib/abort-error'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { getAcademicYears } from '@/lib/onboarding/academic-years'
import { queryKeys } from '@/api/query-keys'
import { usePersonalisationStore } from '@/stores/personalisation.store'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Edulamad'

const STEPS = [
  { n: 1, label: 'Institution' },
  { n: 2, label: 'Faculty & dept' },
  { n: 3, label: 'Programme' },
  { n: 4, label: 'Confirm' },
]

function profileLooksComplete(p) {
  if (!p) return false
  return Boolean(
    p.universityId &&
      p.deptId &&
      p.studentCategory &&
      typeof p.levelData === 'number' &&
      Number.isFinite(p.levelData) &&
      typeof p.semesterData === 'number' &&
      Number.isFinite(p.semesterData),
  )
}

function extractName(raw) {
  if (!raw || typeof raw !== 'object') return null
  const name = raw.name
  return typeof name === 'string' && name.trim() ? name.trim() : null
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <div className="h-[100dvh] overflow-hidden bg-[#f8f8f6] text-slate-900">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,146,60,0.08),_transparent_55%)]" />
        <div className="relative mx-auto flex h-full max-w-3xl flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[max(env(safe-area-inset-top),0.75rem)] sm:px-6 lg:px-8">
          <header className="sticky top-0 z-10 -mx-2 mb-6 flex items-center justify-between gap-4 rounded-2xl bg-[#f8f8f6]/95 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-[#f8f8f6]/80">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-700 ring-1 ring-orange-200">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-800/80">{APP_NAME}</p>
                <p className="text-sm font-medium text-slate-600">Welcome — let&apos;s set up your study profile</p>
              </div>
            </div>
          </header>
          <OnboardingInner />
        </div>
      </div>
    </ProtectedRoute>
  )
}

function OnboardingInner() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const profileQ = useStudentProfile()
  const upsertM = useUpsertStudentProfile()
  const setOnboardingNotice = useAuthStore((s) => s.setOnboardingNotice)
  const user = useAuthStore((s) => s.user)
  const firstName = useMemo(() => {
    const raw = user?.name
    if (typeof raw !== 'string' || !raw.trim()) return ''
    return raw.trim().split(/\s+/)[0] || ''
  }, [user?.name])

  const [step, setStep] = useState(1)
  const [indexNumber, setIndexNumber] = useState('')
  const [levelData, setLevelData] = useState(300)
  const [semesterData, setSemesterData] = useState(1)
  const [studentCategory, setStudentCategory] = useState('regular')
  const [otherStudentCategory, setOtherStudentCategory] = useState('')
  const [academicYear, setAcademicYear] = useState('')

  const [universitySearch, setUniversitySearch] = useState('')
  const [collegeSearch, setCollegeSearch] = useState('')
  const [departmentSearch, setDepartmentSearch] = useState('')
  const [university, setUniversity] = useState(null)
  const [college, setCollege] = useState(null)
  const [department, setDepartment] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [saveState, setSaveState] = useState('idle')

  const didBootstrapStep = useRef(false)

  const academicYears = useMemo(() => getAcademicYears(), [])

  const universitiesQ = useUniversitySearch(universitySearch, true)
  const collegesQ = useCollegeSearch(university?.id || null, collegeSearch, true)
  const departmentsQ = useDepartmentSearch(college?.id || null, departmentSearch, true)
  const coursesQ = useCourseSearch(department?.id || null, '', true)

  const profileUniId = profileQ.data?.universityId
  const uniBootstrapQ = useQuery({
    queryKey: ['onboarding', 'bootstrap-university', profileUniId],
    enabled: Boolean(profileUniId && profileQ.isSuccess),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get(API.institutions.universities.detail(profileUniId), { signal })
      return data
    },
  })

  const isComplete = profileLooksComplete(profileQ.data)

  const canContinueStep1 = Boolean(university?.id)
  /** Step 2: user must pick faculty + department from catalog navigation. */
  const canContinueStep2 = Boolean(college?.id && department?.id)
  /** Profile POST only needs institution + department ids (college is discoverability UX). */
  const canSaveProfile = Boolean(university?.id && department?.id)
  const canContinueStep3 = Boolean(
    studentCategory &&
      (studentCategory !== 'other' || otherStudentCategory.trim().length > 0) &&
      [100, 200, 300, 400].includes(levelData) &&
      [1, 2].includes(semesterData) &&
      Boolean(academicYear) &&
      Boolean(indexNumber.trim()),
  )
  const saveStateLabel =
    saveState === 'saving'
      ? 'Saving progress…'
      : saveState === 'saved'
        ? 'Progress saved'
        : saveState === 'error'
          ? 'Could not save progress'
          : ''

  useEffect(() => {
    if (academicYear || academicYears.length === 0) return
    setAcademicYear(academicYears[0])
  }, [academicYear, academicYears])

  useEffect(() => {
    const p = profileQ.data
    if (!p) return
    if (typeof p.indexNumber === 'string' && p.indexNumber.trim()) {
      setIndexNumber(p.indexNumber.trim())
    }
    if (typeof p.levelData === 'number' && Number.isFinite(p.levelData)) {
      setLevelData(p.levelData)
    }
    if (typeof p.semesterData === 'number' && Number.isFinite(p.semesterData)) {
      setSemesterData(p.semesterData)
    }
    if (typeof p.studentCategory === 'string' && p.studentCategory) {
      setStudentCategory(p.studentCategory)
    }
    if (typeof p.otherStudentCategory === 'string' && p.otherStudentCategory.trim()) {
      setOtherStudentCategory(p.otherStudentCategory.trim())
    }
    if (p.universityId) {
      setUniversity({ id: p.universityId, name: 'Loading…' })
    }
    if (p.deptId) {
      setDepartment({ id: p.deptId, name: 'Select college, then pick your department' })
    }
  }, [profileQ.data])

  useEffect(() => {
    const name = extractName(uniBootstrapQ.data)
    if (!profileUniId || !name) return
    setUniversity((u) => (u?.id === profileUniId ? { id: profileUniId, name } : u))
  }, [uniBootstrapQ.data, profileUniId])

  useEffect(() => {
    if (didBootstrapStep.current || !profileQ.data) return
    const p = profileQ.data
    const hasProgrammeFields = Boolean(
      p.studentCategory &&
        typeof p.levelData === 'number' &&
        Number.isFinite(p.levelData) &&
        typeof p.semesterData === 'number' &&
        Number.isFinite(p.semesterData),
    )
    if (p.universityId && p.deptId && hasProgrammeFields) {
      setStep(4)
    } else if (p.universityId && p.deptId) {
      setStep(3)
    } else if (p.universityId) {
      setStep(2)
    }
    didBootstrapStep.current = true
  }, [profileQ.data])

  const buildPayload = () => {
    if (!university?.id || !department?.id) return null
    const payload = {
      studentCategory,
      universityId: university.id,
      deptId: department.id,
      levelData,
      semesterData,
    }
    const idx = indexNumber.trim()
    if (idx) payload.indexNumber = idx
    if (studentCategory === 'other' && otherStudentCategory.trim()) {
      payload.otherStudentCategory = otherStudentCategory.trim()
    }
    return payload
  }

  const mergeCourseIds = usePersonalisationStore((s) => s.mergeCourseIds)

  const saveProgress = async () => {
    const payload = buildPayload()
    if (!payload) return false
    setSaveState('saving')
    try {
      await upsertM.mutateAsync(payload)
      const deptCourseIds = (coursesQ.data ?? [])
        .map((c) => c.id)
        .filter((id) => typeof id === 'string' && id.length > 0)
      if (deptCourseIds.length > 0) {
        mergeCourseIds(deptCourseIds)
      }
      setSaveState('saved')
      setSubmitError('')
      return true
    } catch (err) {
      setSaveState('error')
      const message =
        err instanceof AppApiError
          ? err.message
          : err instanceof Error && err.message
            ? err.message
            : 'Could not save progress. Please try again.'
      setSubmitError(message)
      return false
    }
  }

  const onContinueFromStep2 = () => {
    if (!canContinueStep2) return
    // Do not POST until step 3: backend Convex often requires index + programme fields together.
    setStep(3)
  }

  const onReviewFromStep3 = async () => {
    if (!canContinueStep3 || !canSaveProfile) return
    const ok = await saveProgress()
    if (ok) setStep(4)
  }

  const onConfirmSubmit = async (evt) => {
    evt.preventDefault()
    if (!university || !department) return
    setSubmitError('')
    try {
      const ok = await saveProgress()
      if (!ok) return
      setOnboardingNotice(null)
      try {
        window.sessionStorage.setItem('edulamad.onboarding.academicYear', academicYear)
      } catch {
        /* ignore */
      }
      await router.replace('/courses')
    } catch (err) {
      const message =
        err instanceof AppApiError
          ? err.message
          : err instanceof Error && err.message
            ? err.message
            : 'Could not save onboarding profile. Please try again.'
      setSubmitError(message)
    }
  }

  if (profileQ.isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-sm text-slate-600">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        Loading your profile…
      </div>
    )
  }

  const goToCourses = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: queryKeys.students.onboardingGate })
      await queryClient.refetchQueries({ queryKey: queryKeys.students.onboardingGate })
    } catch (err) {
      // Cancellations during navigation are expected — don't block the redirect
      if (isAbortLikeError(err)) {
        // intentional no-op
      } else {
        throw err
      }
    }
    await router.replace('/courses')
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-md"
      >
        <div className="animated-border-inner overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
          <div className="relative px-8 pb-10 pt-12 sm:px-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/90 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <CheckCircle2 className="h-9 w-9" strokeWidth={2} aria-hidden />
            </div>
            <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">You&apos;re all set</h2>
            <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-relaxed text-slate-600">
              Your study profile is saved. Jump into your course catalogue for past questions, quizzes, and materials matched to
              your programme.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                className="btn-primary-sweep inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 text-sm font-semibold text-white shadow-md transition hover:bg-orange-700 sm:flex-initial"
                onClick={() => void goToCourses()}
              >
                <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
                Go to my courses
              </button>
              <button
                type="button"
                className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50/80 px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 sm:flex-initial"
                onClick={() => void router.replace('/dashboard')}
              >
                Dashboard
              </button>
            </div>
            <p className="mt-8 text-center text-xs text-slate-500">
              Wrong screen?{' '}
              <button
                type="button"
                className="font-medium text-orange-700 underline decoration-orange-700/30 underline-offset-2 hover:text-orange-800"
                onClick={() => {
                  void queryClient.invalidateQueries({ queryKey: queryKeys.students.profile })
                  void queryClient.invalidateQueries({ queryKey: queryKeys.students.onboardingGate })
                }}
              >
                Refresh profile
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <form onSubmit={onConfirmSubmit} className="flex h-full min-h-0 flex-col">
      <SectionCard className="rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <SectionTitle
          title={firstName ? `Hi ${firstName}` : 'Complete your profile'}
          description="A few details help us surface the right past questions and quizzes for your programme."
          titleClassName="text-2xl font-semibold tracking-tight text-slate-900"
          descriptionClassName="mt-1 text-sm text-slate-600"
        />

        <div className="mt-4 min-h-5 text-xs font-medium text-slate-500" aria-live="polite">
          {saveStateLabel}
        </div>
        <nav className="mt-4" aria-label="Onboarding progress">
          <ol className="flex items-center justify-between gap-1 sm:gap-2">
            {STEPS.map((s, i) => {
              const active = step === s.n
              const done = step > s.n
              return (
                <li key={s.n} className="flex min-w-0 flex-1 items-center gap-2">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      done
                        ? 'bg-emerald-600 text-white'
                        : active
                          ? 'bg-orange-600 text-white ring-2 ring-orange-200'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : s.n}
                  </div>
                  <span
                    className={`hidden min-w-0 truncate text-xs font-medium sm:inline ${
                      active ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 ? (
                    <div
                      className={`mx-1 hidden h-px flex-1 sm:block ${step > s.n ? 'bg-emerald-400' : 'bg-slate-200'}`}
                      aria-hidden
                    />
                  ) : null}
                </li>
              )
            })}
          </ol>
        </nav>
      </SectionCard>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <SectionCard className="rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <div className="mb-4 flex items-center gap-2 text-slate-800">
                  <Building2 className="h-5 w-5 text-orange-600" aria-hidden />
                  <h3 className="text-lg font-semibold">Where do you study?</h3>
                </div>
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
                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    disabled={!canContinueStep1}
                    className="btn-primary-sweep inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setStep(2)}
                  >
                    Continue
                  </button>
                </div>
              </SectionCard>
            </motion.div>
          ) : null}

          {step === 2 ? (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <SectionCard className="rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <div className="mb-4 flex items-center gap-2 text-slate-800">
                  <MapPin className="h-5 w-5 text-orange-600" aria-hidden />
                  <h3 className="text-lg font-semibold">Faculty & department</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
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
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!canContinueStep2}
                    className="btn-primary-sweep inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => onContinueFromStep2()}
                  >
                    Continue
                  </button>
                </div>
              </SectionCard>
            </motion.div>
          ) : null}

          {step === 3 ? (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <SectionCard className="rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <div className="mb-4 flex items-center gap-2 text-slate-800">
                  <GraduationCap className="h-5 w-5 text-orange-600" aria-hidden />
                  <h3 className="text-lg font-semibold">Programme details</h3>
                </div>
                <p className="mb-4 text-xs text-slate-500">
                  Academic year is for your records here; the API stores level and semester. Your profile is saved to the server
                  when you tap <span className="font-semibold text-slate-700">Save &amp; review</span> (index number is required
                  for your deployment).
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-1.5 md:col-span-2">
                    <span className="text-xs font-semibold text-slate-700">Study mode</span>
                    <select
                      value={studentCategory}
                      onChange={(e) => setStudentCategory(e.target.value)}
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="regular">Regular</option>
                      <option value="distance_education">Distance learning</option>
                      <option value="sandwich">Sandwich</option>
                      <option value="evening_weekend">Evening / weekend</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  {studentCategory === 'other' ? (
                    <label className="flex flex-col gap-1.5 md:col-span-2">
                      <span className="text-xs font-semibold text-slate-700">Describe your programme type</span>
                      <input
                        value={otherStudentCategory}
                        onChange={(e) => setOtherStudentCategory(e.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                        placeholder="e.g. Top-up, Affiliated"
                      />
                    </label>
                  ) : null}
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-700">Academic year</span>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    >
                      {academicYears.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-700">Level</span>
                    <select
                      value={String(levelData)}
                      onChange={(e) => setLevelData(Number(e.target.value))}
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="100">100</option>
                      <option value="200">200</option>
                      <option value="300">300</option>
                      <option value="400">400</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-700">Semester</span>
                    <select
                      value={String(semesterData)}
                      onChange={(e) => setSemesterData(Number(e.target.value))}
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5 md:col-span-2">
                    <span className="text-xs font-semibold text-slate-700">Index number</span>
                    <input
                      value={indexNumber}
                      onChange={(e) => setIndexNumber(e.target.value)}
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="e.g. UEB/CS/22/001"
                    />
                    <span className="text-[11px] text-slate-500">
                      Temporary compatibility: the current backend still requires index number on save.
                    </span>
                  </label>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!canContinueStep3}
                    className="btn-primary-sweep inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => void onReviewFromStep3()}
                  >
                    {saveState === 'saving' ? 'Saving…' : 'Save & review'}
                  </button>
                </div>
              </SectionCard>
            </motion.div>
          ) : null}

          {step === 4 ? (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <SectionCard className="rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <h3 className="text-lg font-semibold text-slate-900">Confirm and save</h3>
                <p className="mt-1 text-sm text-slate-600">Check everything below, then save to unlock your course catalogue.</p>
                <dl className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Institution</dt>
                    <dd className="max-w-[60%] text-right font-medium text-slate-900">{university?.name || '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Faculty</dt>
                    <dd className="max-w-[60%] text-right font-medium text-slate-900">{college?.name || '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Department</dt>
                    <dd className="max-w-[60%] text-right font-medium text-slate-900">{department?.name || '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Study mode</dt>
                    <dd className="text-right font-medium text-slate-900">
                      {studentCategory === 'distance_education'
                        ? 'Distance learning'
                        : studentCategory === 'evening_weekend'
                          ? 'Evening / weekend'
                          : studentCategory === 'sandwich'
                            ? 'Sandwich'
                            : studentCategory === 'other'
                              ? otherStudentCategory || 'Other'
                              : 'Regular'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Academic year</dt>
                    <dd className="text-right font-medium text-slate-900">{academicYear || '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Level & semester</dt>
                    <dd className="text-right font-medium text-slate-900">
                      Level {levelData} · Semester {semesterData}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Index number</dt>
                    <dd className="text-right font-medium text-slate-900">{indexNumber.trim() || '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-slate-200/80 pt-3">
                    <dt className="text-slate-500">Courses in catalog</dt>
                    <dd className="text-right font-medium text-slate-900">
                      {coursesQ.isLoading ? 'Loading…' : `${coursesQ.data?.length ?? 0} courses`}
                    </dd>
                  </div>
                </dl>
                {submitError ? (
                  <div className="mt-4 whitespace-pre-wrap rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                    {submitError}
                  </div>
                ) : null}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    onClick={() => setStep(3)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={upsertM.isPending || !canSaveProfile || !canContinueStep3}
                    className="btn-primary-sweep inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {upsertM.isPending ? 'Saving…' : 'Go to my courses'}
                  </button>
                </div>
              </SectionCard>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </form>
  )
}
