import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Bell,
  Bookmark,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronUp,
  Clock3,
  LayoutGrid,
  ListOrdered,
  Target,
  Search,
  Shield,
  Sparkles,
  Table2,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import {
  useCollegeSearch,
  useCourseSearch,
  useDepartmentSearch,
  useUniversitySearch,
} from '@/hooks/institutions/useInstitutionsCatalog'
import { useCourseQuestions } from '@/hooks/questions/useCourseQuestions'
import { useUploadQueuePreviewMutation } from '@/hooks/questions/useUploadQueuePreviewMutation'
import { useAdminClearQuestionSolutions } from '@/hooks/admin/useAdminClearQuestionSolutions'
import { pickFirstHttpUrl } from '@/lib/api/pick-http-url'
import {
  useAdminStats,
  useAnalyticsMe,
  useMyNotifications,
  useStudentProfile,
  useStudentStreak,
  useStudentXp,
} from '@/hooks/dashboard/useDashboardOverview'
import EntityCombobox from './forms/EntityCombobox'
import DataTable from './DataTable'
import CourseQuestionCard from './questions/CourseQuestionCard'
import { useAuthStore } from '@/stores/auth.store'
import { sessionHasAdminTools } from '@/lib/session-admin-access'
import SectionCard from '@/components/atoms/SectionCard'
import StatCard from '@/components/molecules/StatCard'
import OnboardingNotice from '@/components/organisms/OnboardingNotice'
import CopyableId from './admin/CopyableId'
import { SkeletonNotificationRow, SkeletonQuestionCard, SkeletonStatCard } from '@/components/ui/skeleton'
import { loadQuizBookmarks } from '@/lib/quiz/bookmarks'
import { buildQuizHref } from '@/lib/quiz/build-quiz-href'
import { isPlatformSuperAdminFromAccessToken } from '@/lib/jwt-payload'
import StudentStudyQuickLinks from './StudentStudyQuickLinks'
import DashboardFlashcardsStrip from './DashboardFlashcardsStrip'
import { QuestionLimitBanner } from '@/components/dashboard/QuestionLimitBanner'
import { UpgradeCard } from '@/components/dashboard/UpgradeCard'
import { FeatureTeasers } from '@/components/dashboard/FeatureTeasers'
import { ExamCountdownTeaser } from '@/components/dashboard/ExamCountdownTeaser'
import { ActivityFeed } from '@/components/activity/ActivityFeed'
import { QuizSuggestions } from '@/components/dashboard/QuizSuggestions'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'Edulamad'

/** Past-question API `type` query; `all` omits param so mixed imports (e.g. essay + theory) all load. */
const QUESTION_TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'theory', label: 'Theory' },
  { value: 'objective', label: 'Objective' },
  { value: 'practical', label: 'Practical' },
  { value: 'essay', label: 'Essay' },
  { value: 'mcq', label: 'MCQ' },
]

function SelectField({ label, value, onChange, options, disabled = false }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-11 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
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

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-200">
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
    </div>
  )
}

/** Admin catalog: shows entity name + copyable ID for the current picker chain. */
function CatalogSelectionChip({ label, name, id }) {
  if (!id) return null
  return (
    <div className="flex min-w-0 max-w-full flex-1 flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 sm:min-w-[200px] sm:max-w-[280px]">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {name ? (
        <span className="truncate text-sm font-medium text-slate-200" title={name}>
          {name}
        </span>
      ) : null}
      <CopyableId value={String(id)} />
    </div>
  )
}

function asRecord(v) {
  return v && typeof v === 'object' ? v : null
}

function pickArray(v) {
  if (Array.isArray(v)) return v
  const rec = asRecord(v)
  if (!rec) return []
  const candidates = ['items', 'data', 'results', 'rows']
  for (const key of candidates) {
    if (Array.isArray(rec[key])) return rec[key]
  }
  return []
}

function toStudentCategoryLabel(value, otherValue) {
  if (!value) return '—'
  const map = {
    regular: 'Regular',
    distance_education: 'Distance education',
    sandwich: 'Sandwich',
    evening_weekend: 'Evening / weekend',
    other: otherValue || 'Other',
  }
  return map[value] || value
}

function timeAgo(iso) {
  if (!iso) return ''
  const at = new Date(iso).getTime()
  if (!Number.isFinite(at)) return ''
  const diff = Math.max(0, Date.now() - at)
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function TinySparkline({ values }) {
  const max = Math.max(...values, 1)
  return (
    <div className="mt-2 flex h-8 items-end gap-1">
      {values.map((v, idx) => (
        <span
          key={`${v}-${idx}`}
          className="w-1.5 rounded-sm bg-gradient-to-t from-orange-500/80 to-amber-300/90"
          style={{ height: `${Math.max(14, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}

function TimeframeTabs({ value, onChange }) {
  const tabs = ['Today', 'This Week', 'This Semester']
  return (
    <div className="inline-flex max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/10 p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            value === tab
              ? 'bg-orange-500 text-white'
              : 'text-slate-100 hover:bg-white/15'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

function CommandBar({ search, onSearch, onResetFilters, timeframe, setTimeframe }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f172a]/75 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-full sm:basis-auto sm:min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Quick find courses, codes, or focus topics..."
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-slate-100 focus:border-orange-500/60 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <Link
          href="/onboarding"
          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
        >
          Profile setup
        </Link>
        <button
          type="button"
          onClick={onResetFilters}
          className="btn-primary-sweep inline-flex min-h-10 min-w-[120px] items-center justify-center rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          Reset filters
        </button>
        <div className="w-full sm:ml-auto sm:w-auto">
          <TimeframeTabs value={timeframe} onChange={setTimeframe} />
        </div>
      </div>
    </div>
  )
}

function StudentCollapsible({ title, defaultOpen = true, children }) {
  return (
    <details open={defaultOpen} className="rounded-xl border border-white/10 bg-white/[0.03]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-sm font-semibold text-slate-100">
        <span className="break-words">{title}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-300" />
      </summary>
      <div className="border-t border-white/10 px-3 py-3">{children}</div>
    </details>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const queryClient = useQueryClient()
  const sessionUser = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const isPlatformSuperAdmin =
    sessionUser?.isPlatformSuperAdmin === true ||
    isPlatformSuperAdminFromAccessToken(accessToken)
  const [timeframe, setTimeframe] = useState('This Week')
  const [activeOnly, setActiveOnly] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [level, setLevel] = useState('300')
  const [type, setType] = useState('all')
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
  const [questionForm, setQuestionForm] = useState({
    courseId: '',
    year: '2024',
    levelData: '300',
    questionText: '',
    type: 'theory',
    source: 'manual',
  })
  const [flashcardForm, setFlashcardForm] = useState({
    courseId: '',
    front: '',
    back: '',
    source: 'manual',
  })
  const [promoForm, setPromoForm] = useState({
    code: '',
    unlocksPlan: 'basic',
    maxRedemptions: '100',
    expiresAt: '',
    questionCredits: '',
    creditExpiresAt: '',
  })
  const [adminActionStatus, setAdminActionStatus] = useState({
    question: '',
    flashcard: '',
    promo: '',
  })
  const [adminActionLoading, setAdminActionLoading] = useState({
    question: false,
    flashcard: false,
    promo: false,
    bundle: false,
  })
  const [bundleUpload, setBundleUpload] = useState({
    courseId: '',
    pdf: null,
    json: null,
  })
  const [bundleStatus, setBundleStatus] = useState('')
  const [catalogStatus, setCatalogStatus] = useState('')
  const [adminPanel, setAdminPanel] = useState('manage')
  /** `browse` = filters + directory tables; `create` = add/edit entity forms only. */
  const [catalogManageView, setCatalogManageView] = useState('browse')
  const [universityStatusFilter, setUniversityStatusFilter] = useState('all')
  const [collegeStatusFilter, setCollegeStatusFilter] = useState('all')
  const [departmentStatusFilter, setDepartmentStatusFilter] = useState('all')
  const [courseStatusFilter, setCourseStatusFilter] = useState('all')
  const [collapsedCatalogCards, setCollapsedCatalogCards] = useState({
    universities: false,
    colleges: false,
    departments: false,
    courses: false,
  })
  const [quizBookmarks, setQuizBookmarks] = useState([])
  const seededQuestionFilters = useRef(false)
  const [universityForm, setUniversityForm] = useState({
    id: '',
    name: '',
    acronym: '',
    location: '',
    type: 'public',
    isActive: true,
  })
  const [collegeForm, setCollegeForm] = useState({
    id: '',
    name: '',
    code: '',
    universityId: '',
    isActive: true,
  })
  const [departmentForm, setDepartmentForm] = useState({
    id: '',
    name: '',
    code: '',
    collegeId: '',
    isActive: true,
  })
  const [courseFormState, setCourseFormState] = useState({
    id: '',
    name: '',
    code: '',
    deptId: '',
    isActive: true,
  })
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
  const questionTypeMix = useMemo(() => {
    const rows = questionsQ.data
    if (!rows?.length) return []
    const counts = new Map()
    for (const q of rows) {
      const t = String(q.type || 'unknown').toLowerCase()
      counts.set(t, (counts.get(t) || 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([t, n]) => ({ type: t, count: n }))
  }, [questionsQ.data])
  const profileQ = useStudentProfile()
  const streakQ = useStudentStreak()
  const xpQ = useStudentXp()
  const analyticsQ = useAnalyticsMe()
  const adminStatsQ = useAdminStats(isPlatformSuperAdmin)
  const notificationsQ = useMyNotifications(5)
  const isAdmin = sessionHasAdminTools(sessionUser, accessToken)
  const streakValue =
    streakQ.data ??
    profileQ.data?.streakDays ??
    profileQ.data?.streak ??
    0
  const xpValue =
    xpQ.data ??
    profileQ.data?.xpTotal ??
    profileQ.data?.totalXp ??
    profileQ.data?.xp ??
    0

  const adminHashMigrated = useRef(false)

  /** Non-admins must not keep ?admin= deep links (bookmark / shared URL). */
  useEffect(() => {
    if (!router.isReady || isAdmin) return
    const raw = router.query.admin
    if (raw == null || raw === '') return
    void router.replace({ pathname: '/dashboard' }, undefined, { shallow: true })
  }, [router.isReady, isAdmin, router, router.query.admin])

  const setAdminPanelTab = (panel) => {
    if (!isAdmin) return
    setAdminPanel(panel)
    const admin = panel === 'manage' ? 'catalog' : 'create'
    void router.replace(
      { pathname: '/dashboard', query: { admin } },
      undefined,
      { shallow: true },
    )
  }

  useEffect(() => {
    if (!router.isReady || !isAdmin) return
    const raw = router.query.admin
    const v = Array.isArray(raw) ? raw[0] : raw
    if (v === 'create') setAdminPanel('create')
    else if (v === 'catalog' || v === 'manage') setAdminPanel('manage')
  }, [router.isReady, router.query.admin, isAdmin])

  /** Deep links from sidebar: `/dashboard?admin=…#anchor` */
  useEffect(() => {
    if (!router.isReady || !isAdmin || typeof window === 'undefined') return
    const hash = router.asPath.split('#')[1]?.split('&')[0]
    if (!hash || !hash.startsWith('admin')) return
    const t = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => window.clearTimeout(t)
  }, [router.isReady, router.asPath, isAdmin, adminPanel])

  /** Legacy #admin-* bookmarks → ?admin= (Next client navigation often skips hash updates). */
  useEffect(() => {
    if (!router.isReady || !isAdmin || typeof window === 'undefined') return
    if (adminHashMigrated.current) return
    const h = window.location.hash.replace(/^#/, '')
    if (h !== 'admin-catalog' && h !== 'admin-manage' && h !== 'admin-create') return
    adminHashMigrated.current = true
    const admin = h === 'admin-create' ? 'create' : 'catalog'
    void router.replace(
      { pathname: '/dashboard', query: { admin } },
      undefined,
      { shallow: true },
    )
  }, [router.isReady, isAdmin, router])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const refresh = () => setQuizBookmarks(loadQuizBookmarks().slice(0, 8))
    refresh()
    window.addEventListener('focus', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const shouldPromptOnboarding = !isAdmin
  const isOnboardingComplete = Boolean(
    profileQ.data?.universityId &&
      profileQ.data?.deptId &&
      (profileQ.data?.levelData ?? profileQ.data?.level),
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

  useEffect(() => {
    const profileLevel = profileQ.data?.levelData ?? profileQ.data?.level
    if (!profileLevel || seededQuestionFilters.current) return
    const normalized = String(profileLevel)
    if (['100', '200', '300', '400', '500'].includes(normalized)) {
      setLevel(normalized)
      seededQuestionFilters.current = true
    }
  }, [profileQ.data?.level, profileQ.data?.levelData])

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
  const adminStatsPreview =
    adminStatsQ.data && typeof adminStatsQ.data === 'object'
      ? Object.entries(adminStatsQ.data).slice(0, 6)
      : []

  const universityTableRows = useMemo(
    () =>
      universities.map((u) => ({
        id: u.id,
        name: u.name,
        code: u.code || '—',
        status: u.isActive === false ? 'Inactive' : 'Active',
      })),
    [universities],
  )

  const filteredUniversityRows = useMemo(() => {
    if (universityStatusFilter === 'active') {
      return universityTableRows.filter((r) => r.status === 'Active')
    }
    if (universityStatusFilter === 'inactive') {
      return universityTableRows.filter((r) => r.status === 'Inactive')
    }
    return universityTableRows
  }, [universityTableRows, universityStatusFilter])
  const filterByStatus = useCallback((rows, statusFilter) => {
    if (statusFilter === 'active') return rows.filter((r) => r.status === 'Active')
    if (statusFilter === 'inactive') return rows.filter((r) => r.status === 'Inactive')
    return rows
  }, [])

  const collegeTableRows = useMemo(
    () =>
      colleges.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code || '—',
        university: universityValue?.name || 'Selected institution',
        status: c.isActive === false ? 'Inactive' : 'Active',
      })),
    [colleges, universityValue],
  )
  const filteredCollegeRows = useMemo(
    () => filterByStatus(collegeTableRows, collegeStatusFilter),
    [collegeTableRows, collegeStatusFilter, filterByStatus],
  )

  const departmentTableRows = useMemo(
    () =>
      departments.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code || '—',
        college: collegeValue?.name || 'Selected college',
        status: d.isActive === false ? 'Inactive' : 'Active',
      })),
    [departments, collegeValue],
  )
  const filteredDepartmentRows = useMemo(
    () => filterByStatus(departmentTableRows, departmentStatusFilter),
    [departmentTableRows, departmentStatusFilter, filterByStatus],
  )

  const courseTableRows = useMemo(
    () =>
      courseResults.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code || '—',
        department: departmentValue?.name || 'Selected department',
        status: c.isActive === false ? 'Inactive' : 'Active',
      })),
    [courseResults, departmentValue],
  )
  const filteredCourseRows = useMemo(
    () => filterByStatus(courseTableRows, courseStatusFilter),
    [courseTableRows, courseStatusFilter, filterByStatus],
  )

  /** Click a directory row to drive the combobox chain (same as picking from search). */
  const selectCatalogUniversity = useCallback((row) => {
    const id = row?.id != null ? String(row.id) : ''
    if (!id) return
    setUniversityId(id)
    setUniversityValue({
      id,
      name: row.name || '',
      code: row.code && row.code !== '—' ? row.code : undefined,
    })
    setInstitutionSearch(row.name || '')
  }, [])

  const selectCatalogCollege = useCallback((row) => {
    const id = row?.id != null ? String(row.id) : ''
    if (!id) return
    setCollegeId(id)
    setCollegeValue({
      id,
      name: row.name || '',
      code: row.code && row.code !== '—' ? row.code : undefined,
    })
    setCollegeSearch(row.name || '')
  }, [])

  const selectCatalogDepartment = useCallback((row) => {
    const id = row?.id != null ? String(row.id) : ''
    if (!id) return
    setDepartmentId(id)
    setDepartmentValue({
      id,
      name: row.name || '',
      code: row.code && row.code !== '—' ? row.code : undefined,
    })
    setDepartmentSearch(row.name || '')
  }, [])

  const selectCatalogCourse = useCallback((row) => {
    const id = row?.id != null ? String(row.id) : ''
    if (!id) return
    setCourseId(id)
    setCourseValue({
      id,
      name: row.name || '',
      code: row.code && row.code !== '—' ? row.code : undefined,
    })
    setCourseSearch(row.name || '')
  }, [])

  const invalidateInstitutionQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['institutions'] })
  }

  const catalogErrorMessage = (err, fallback) => (err instanceof Error ? err.message : fallback)

  const createUniversityM = useMutation({
    mutationFn: async (payload) => apiClient.post(API.institutions.universities.list, payload),
    onSuccess: invalidateInstitutionQueries,
  })
  const updateUniversityM = useMutation({
    mutationFn: async ({ id, payload }) => apiClient.patch(API.institutions.universities.detail(id), payload),
    onSuccess: invalidateInstitutionQueries,
  })
  const createCollegeM = useMutation({
    mutationFn: async (payload) => apiClient.post(API.institutions.colleges.list, payload),
    onSuccess: invalidateInstitutionQueries,
  })
  const updateCollegeM = useMutation({
    mutationFn: async ({ id, payload }) => apiClient.patch(API.institutions.colleges.detail(id), payload),
    onSuccess: invalidateInstitutionQueries,
  })
  const createDepartmentM = useMutation({
    mutationFn: async (payload) => apiClient.post(API.institutions.departments.list, payload),
    onSuccess: invalidateInstitutionQueries,
  })
  const updateDepartmentM = useMutation({
    mutationFn: async ({ id, payload }) => apiClient.patch(API.institutions.departments.detail(id), payload),
    onSuccess: invalidateInstitutionQueries,
  })
  const createCourseM = useMutation({
    mutationFn: async (payload) => apiClient.post(API.institutions.courses.list, payload),
    onSuccess: invalidateInstitutionQueries,
  })
  const updateCourseM = useMutation({
    mutationFn: async ({ id, payload }) => apiClient.patch(API.institutions.courses.detail(id), payload),
    onSuccess: invalidateInstitutionQueries,
  })

  const universityColumns = useMemo(
    () => [
      { header: 'University', accessor: 'name', sortable: true, searchable: true },
      { header: 'Code', accessor: 'code', sortable: true, searchable: true },
      { header: 'Status', accessor: 'status', sortable: true },
      {
        header: 'ID',
        accessor: 'id',
        sortable: true,
        cell: (row) => <CopyableId value={String(row.id)} />,
      },
      {
        header: 'Actions',
        accessor: 'actions',
        cell: (row) => {
          const rowId = row?.id != null ? String(row.id) : ''
          return (
            <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setCatalogManageView('create')
                  setUniversityForm({
                    id: rowId,
                    name: row.name || '',
                    acronym: row.code === '—' ? '' : row.code,
                    location: '',
                    type: 'public',
                    isActive: row.status !== 'Inactive',
                  })
                }}
                className="rounded border border-white/20 bg-white/[0.04] px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await updateUniversityM.mutateAsync({
                      id: rowId,
                      payload: { isActive: row.status === 'Inactive' },
                    })
                    setCatalogStatus(
                      row.status === 'Inactive' ? 'University activated.' : 'University deactivated.',
                    )
                  } catch (err) {
                    setCatalogStatus(catalogErrorMessage(err, 'Failed to update university status.'))
                  }
                }}
                className={`rounded border px-2 py-1 text-xs ${
                  row.status === 'Inactive'
                    ? 'border-emerald-400/60 text-emerald-300 hover:bg-emerald-500/10'
                    : 'border-amber-400/60 text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                {row.status === 'Inactive' ? 'Activate' : 'Deactivate'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await updateUniversityM.mutateAsync({ id: rowId, payload: { isActive: false } })
                    setCatalogStatus('University deleted (deactivated).')
                  } catch (err) {
                    setCatalogStatus(catalogErrorMessage(err, 'Failed to delete university.'))
                  }
                }}
                className="rounded border border-rose-400/60 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
              >
                Delete
              </button>
            </div>
          )
        },
      },
    ],
    [updateUniversityM],
  )
  const collegeColumns = useMemo(
    () => [
      { header: 'College', accessor: 'name', sortable: true, searchable: true },
      { header: 'University', accessor: 'university', sortable: true, searchable: true },
      { header: 'Code', accessor: 'code', sortable: true, searchable: true },
      { header: 'Status', accessor: 'status', sortable: true },
      {
        header: 'ID',
        accessor: 'id',
        sortable: true,
        cell: (row) => <CopyableId value={String(row.id)} />,
      },
      {
        header: 'Actions',
        accessor: 'actions',
        cell: (row) => {
          const rowId = row?.id != null ? String(row.id) : ''
          return (
            <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setCatalogManageView('create')
                  setCollegeForm({
                    id: rowId,
                    name: row.name || '',
                    code: row.code === '—' ? '' : row.code,
                    universityId,
                    isActive: row.status !== 'Inactive',
                  })
                }}
                className="rounded border border-white/20 bg-white/[0.04] px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await updateCollegeM.mutateAsync({ id: rowId, payload: { isActive: false } })
                    setCatalogStatus('College archived.')
                  } catch (err) {
                    setCatalogStatus(catalogErrorMessage(err, 'Failed to archive college.'))
                  }
                }}
                className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
              >
                Archive
              </button>
            </div>
          )
        },
      },
    ],
    [universityId, updateCollegeM],
  )
  const departmentColumns = useMemo(
    () => [
      { header: 'Department', accessor: 'name', sortable: true, searchable: true },
      { header: 'College', accessor: 'college', sortable: true, searchable: true },
      { header: 'Code', accessor: 'code', sortable: true, searchable: true },
      { header: 'Status', accessor: 'status', sortable: true },
      {
        header: 'ID',
        accessor: 'id',
        sortable: true,
        cell: (row) => <CopyableId value={String(row.id)} />,
      },
      {
        header: 'Actions',
        accessor: 'actions',
        cell: (row) => {
          const rowId = row?.id != null ? String(row.id) : ''
          return (
            <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setCatalogManageView('create')
                  setDepartmentForm({
                    id: rowId,
                    name: row.name || '',
                    code: row.code === '—' ? '' : row.code,
                    collegeId,
                    isActive: row.status !== 'Inactive',
                  })
                }}
                className="rounded border border-white/20 bg-white/[0.04] px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await updateDepartmentM.mutateAsync({ id: rowId, payload: { isActive: false } })
                    setCatalogStatus('Department archived.')
                  } catch (err) {
                    setCatalogStatus(catalogErrorMessage(err, 'Failed to archive department.'))
                  }
                }}
                className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
              >
                Archive
              </button>
            </div>
          )
        },
      },
    ],
    [collegeId, updateDepartmentM],
  )
  const courseColumns = useMemo(
    () => [
      { header: 'Course', accessor: 'name', sortable: true, searchable: true },
      { header: 'Department', accessor: 'department', sortable: true, searchable: true },
      { header: 'Code', accessor: 'code', sortable: true, searchable: true },
      { header: 'Status', accessor: 'status', sortable: true },
      {
        header: 'ID',
        accessor: 'id',
        sortable: true,
        cell: (row) => <CopyableId value={String(row.id)} />,
      },
      {
        header: 'Actions',
        accessor: 'actions',
        cell: (row) => {
          const rowId = row?.id != null ? String(row.id) : ''
          return (
            <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setCatalogManageView('create')
                  setCourseFormState({
                    id: rowId,
                    name: row.name || '',
                    code: row.code === '—' ? '' : row.code,
                    deptId: departmentId,
                    isActive: row.status !== 'Inactive',
                  })
                }}
                className="rounded border border-white/20 bg-white/[0.04] px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await updateCourseM.mutateAsync({ id: rowId, payload: { isActive: false } })
                    setCatalogStatus('Course archived.')
                  } catch (err) {
                    setCatalogStatus(catalogErrorMessage(err, 'Failed to archive course.'))
                  }
                }}
                className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
              >
                Archive
              </button>
            </div>
          )
        },
      },
    ],
    [departmentId, updateCourseM],
  )

  const promoCodesQ = useQuery({
    queryKey: ['admin', 'promo', 'codes'],
    enabled: isAdmin && isPlatformSuperAdmin,
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get(API.admin.promo.codes, { signal })
      return pickArray(data)
    },
  })

  const uploadQueueQ = useQuery({
    queryKey: ['questions', 'upload-queue', 'admin'],
    enabled: isAdmin && isPlatformSuperAdmin,
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get(API.questions.uploadQueue, { signal })
      return pickArray(data)
    },
  })

  const uploadQueuePreviewM = useUploadQueuePreviewMutation()
  const [uploadPreviewFeedback, setUploadPreviewFeedback] = useState(null)

  const clearQuestionSolutionsM = useAdminClearQuestionSolutions()

  const deactivatePromoM = useMutation({
    mutationFn: async (id) => {
      await apiClient.post(API.admin.promo.deactivate(id))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'promo', 'codes'] })
    },
  })

  const sectionMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-50px' },
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
      }

  const toggleCatalogCard = (key) => {
    setCollapsedCatalogCards((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      <motion.section
        {...sectionMotion}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#111827] via-[#0f172a] to-[#111827] p-6 text-white shadow-[0_20px_55px_rgba(15,23,42,0.3)]"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-orange-500/25 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-orange-200">
              <Sparkles className="h-3.5 w-3.5" />
              {isAdmin ? 'Admin console' : 'Study cockpit'}
            </p>
            <h2 className="mt-3 break-words text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back{sessionUser?.name ? `, ${String(sessionUser.name).split(' ')[0]}` : ''}.
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-100">
              {isAdmin
                ? 'Manage catalogue records, content pipeline, and promo operations from one clean workspace.'
                : 'Your dashboard is focused on your department first, then your university context.'}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-wider text-orange-200">
              Focus window: {timeframe}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                `${courses.length} courses loaded`,
                `${notificationsQ.data?.length ?? 0} recent notifications`,
                `Questions solved: ${questionsSolved ?? '—'}`,
              ].map((chip) => (
                <span
                  key={chip}
                  className="max-w-full break-words rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-100"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2" />
        </div>
      </motion.section>

      {isAdmin ? (
        <motion.section {...sectionMotion} id="admin-panel-tabs" className="scroll-mt-24">
          <div className="inline-flex rounded-xl border border-white/10 bg-[#0b101a]/95 p-1">
            <button
              type="button"
              onClick={() => setAdminPanelTab('manage')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                adminPanel === 'manage'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              Manage records
            </button>
            <button
              type="button"
              onClick={() => setAdminPanelTab('create')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                adminPanel === 'create'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              Create content
            </button>
          </div>
        </motion.section>
      ) : null}

      {!isAdmin ? (
        <motion.section {...sectionMotion}>
          <QuestionLimitBanner />
        </motion.section>
      ) : null}

      {!isAdmin ? (
        <motion.section {...sectionMotion}>
          <StudentStudyQuickLinks variant="light" />
        </motion.section>
      ) : null}

      {!isAdmin ? (
        <motion.section {...sectionMotion}>
          <DashboardFlashcardsStrip />
        </motion.section>
      ) : null}

      {!isAdmin ? (
        <motion.section {...sectionMotion}>
          <CommandBar
            search={search}
            onSearch={setSearch}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            onResetFilters={() => {
              setYear('2024')
              setLevel('300')
              setType('all')
              setUniversityId('')
              setCollegeId('')
              setDepartmentId('')
              setCourseId('')
              setUniversityValue(null)
              setCollegeValue(null)
              setDepartmentValue(null)
              setCourseValue(null)
              setInstitutionSearch('')
              setCollegeSearch('')
              setDepartmentSearch('')
              setCourseSearch('')
              setSearch('')
            }}
          />
        </motion.section>
      ) : null}

      {!isAdmin ? (
        <motion.section {...sectionMotion} className="grid gap-4 xl:grid-cols-12">
          <div className="space-y-3 xl:col-span-8">
            <UpgradeCard />
            <FeatureTeasers />
            <SectionCard>
              <div className="flex items-center justify-between gap-2">
                <SectionTitle icon={Target} title="Quiz picks for you" />
                <Link href="/quiz/discover" className="text-xs font-semibold text-orange-300 hover:text-orange-200">
                  Discover
                </Link>
              </div>
              <QuizSuggestions />
            </SectionCard>
          </div>
          <div className="xl:col-span-4">
            <ExamCountdownTeaser
              courseId={courseResults[0]?.id}
              courseName={courseResults[0]?.name}
            />
          </div>
        </motion.section>
      ) : null}

      {!isAdmin ? (
        <motion.section {...sectionMotion} className="grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-6">
            <SectionCard>
              <StudentCollapsible title="Your courses">
                <div className="flex items-center justify-between gap-2">
                  <SectionTitle icon={BookOpen} title="Your courses" />
                  <Link href="/courses" className="text-xs font-semibold text-orange-300 hover:text-orange-200">
                    See all
                  </Link>
                </div>
                {courseResults.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-300">
                    Your dashboard shows courses in your department first.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {courseResults.slice(0, 6).map((course) => (
                      <li key={course.id}>
                        <Link
                          href={`/courses/${course.id}`}
                          className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 hover:bg-white/[0.08]"
                        >
                          <span className="min-w-0 break-words text-sm text-slate-100">
                            {course.code ? `${course.code} — ` : ''}
                            {course.name}
                          </span>
                          <span className="shrink-0 text-xs text-slate-300">Open</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </StudentCollapsible>
            </SectionCard>
          </div>
          <div className="xl:col-span-6">
            <SectionCard>
              <StudentCollapsible title="Continue where you left off" defaultOpen={false}>
                <SectionTitle icon={ListOrdered} title="Continue where you left off" />
                {quizBookmarks.length ? (
                  <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3">
                    <p className="break-words text-sm text-slate-100">{quizBookmarks[0].title}</p>
                    <p className="mt-1 text-xs text-slate-300">Saved {timeAgo(quizBookmarks[0].savedAt)}</p>
                    <Link
                      href={quizBookmarks[0].href}
                      className="mt-2 inline-flex text-xs font-semibold text-orange-300 hover:text-orange-200"
                    >
                      Continue
                    </Link>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-300">
                    Start a quiz and save it for quick continue access.
                  </p>
                )}
              </StudentCollapsible>
            </SectionCard>
          </div>
        </motion.section>
      ) : null}

      {!isAdmin ? (
      <motion.section {...sectionMotion} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <StatCard
            label="Student profile"
            value={toStudentCategoryLabel(profileQ.data?.studentCategory, profileQ.data?.otherStudentCategory)}
            hint={`Level ${profileQ.data?.levelData ?? profileQ.data?.level ?? '—'}`}
            tone="violet"
          />
        </div>
        <div>
          <StatCard label="Current streak" value={streakValue} tone="orange" />
        </div>
        <div>
          <StatCard label="Total XP" value={xpValue} tone="emerald" />
        </div>
      </motion.section>
      ) : null}

      {shouldPromptOnboarding && (!isOnboardingComplete || onboardingNotice) ? (
        <OnboardingNotice
          notice={onboardingNotice}
          onDismiss={() => setOnboardingNotice(null)}
        />
      ) : null}

      {!isAdmin ? (
      <motion.section {...sectionMotion} className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-12">
          <SectionCard>
            <SectionTitle icon={Clock3} title="Recent activity" />
            <ActivityFeed limit={6} compact showHeaderLink />

            <div className="mt-5 border-t border-white/10 pt-4">
              <StudentCollapsible title="Bookmarks" defaultOpen={false}>
                <div className="flex items-center justify-between gap-2">
                <SectionTitle icon={Bookmark} title="Bookmarks" />
                <Link
                  href="/quiz/new"
                  className="text-[11px] font-semibold text-orange-300 hover:text-orange-200"
                >
                  Open practice
                </Link>
              </div>
              {quizBookmarks.length ? (
                <ul className="mt-3 space-y-2">
                  {quizBookmarks.map((b) => (
                    <li key={b.id} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                      <Link
                        href={b.href}
                        className="block break-words text-sm font-medium text-slate-100 hover:text-orange-200"
                      >
                        {b.title}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-slate-500">{timeAgo(b.savedAt)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-400">
                  No bookmarks yet. Save quizzes in practice mode and they will appear here.
                </p>
              )}
              </StudentCollapsible>
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <StudentCollapsible title="Notifications" defaultOpen={false}>
              <SectionTitle icon={Bell} title="Notifications" />
              {notificationsQ.isLoading ? (
                <div className="mt-3 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonNotificationRow key={`dashboard-notification-skeleton-${i}`} />
                  ))}
                </div>
              ) : notificationsQ.isError ? (
                <p className="mt-3 text-sm text-slate-400">Notifications unavailable.</p>
              ) : notificationsQ.data?.length ? (
                <ul className="mt-3 space-y-2">
                  {notificationsQ.data.slice(0, 4).map((note) => (
                    <li key={note.id} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm">
                      <p className="text-slate-100">{note.title}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-400">No notifications.</p>
              )}
              </StudentCollapsible>
            </div>
          </SectionCard>
        </div>
      </motion.section>
      ) : null}

      {isAdmin ? (
      <motion.section {...sectionMotion} className="grid gap-4 lg:grid-cols-2">
        <SectionCard>
          <SectionTitle icon={Shield} title="Admin stats" />
          {adminStatsQ.isError ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Not available for this user role.
            </p>
          ) : adminStatsQ.isLoading ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonStatCard key={`admin-stats-skeleton-${i}`} />
              ))}
            </div>
          ) : adminStatsPreview.length ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {adminStatsPreview.map(([key, val]) => (
                <div
                  key={key}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {key}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {typeof val === 'number' || typeof val === 'string'
                      ? String(val)
                      : JSON.stringify(val)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <pre className="mt-3 max-h-40 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-700 dark:bg-neutral-900 dark:text-slate-300">
              {JSON.stringify(adminStatsQ.data || {}, null, 2)}
            </pre>
          )}
        </SectionCard>
      </motion.section>
      ) : null}

      {isAdmin && adminPanel === 'create' ? (
        <motion.section {...sectionMotion} id="admin-create" className="scroll-mt-24 grid gap-4 xl:grid-cols-3">
          <SectionCard id="admin-create-question" className="scroll-mt-28">
            <SectionTitle icon={BookOpen} title="Create question" />
            <form
              className="mt-3 space-y-2"
              onSubmit={async (e) => {
                e.preventDefault()
                setAdminActionLoading((s) => ({ ...s, question: true }))
                setAdminActionStatus((s) => ({ ...s, question: '' }))
                try {
                  const fd = new FormData()
                  fd.append('courseId', questionForm.courseId.trim())
                  fd.append('year', questionForm.year.trim())
                  fd.append('levelData', questionForm.levelData.trim())
                  fd.append('questionText', questionForm.questionText.trim())
                  fd.append('type', questionForm.type.trim())
                  fd.append('source', questionForm.source.trim())
                  await apiClient.post(API.questions.create, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                  })
                  setAdminActionStatus((s) => ({ ...s, question: 'Question created successfully.' }))
                  setQuestionForm((v) => ({ ...v, questionText: '' }))
                } catch (err) {
                  const msg = err instanceof Error ? err.message : 'Failed to create question.'
                  setAdminActionStatus((s) => ({ ...s, question: msg }))
                } finally {
                  setAdminActionLoading((s) => ({ ...s, question: false }))
                }
              }}
            >
              <input
                placeholder="Course ID"
                value={questionForm.courseId}
                onChange={(e) => setQuestionForm((s) => ({ ...s, courseId: e.target.value }))}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Year"
                  value={questionForm.year}
                  onChange={(e) => setQuestionForm((s) => ({ ...s, year: e.target.value }))}
                  className="h-11 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                  required
                />
                <input
                  placeholder="Level"
                  value={questionForm.levelData}
                  onChange={(e) => setQuestionForm((s) => ({ ...s, levelData: e.target.value }))}
                  className="h-11 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                  required
                />
              </div>
              <input
                placeholder="Type (theory/objective/practical)"
                value={questionForm.type}
                onChange={(e) => setQuestionForm((s) => ({ ...s, type: e.target.value }))}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                required
              />
              <textarea
                placeholder="Question text"
                value={questionForm.questionText}
                onChange={(e) => setQuestionForm((s) => ({ ...s, questionText: e.target.value }))}
                className="min-h-24 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-sm text-slate-100"
                required
              />
              <button
                type="submit"
                disabled={adminActionLoading.question}
                className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {adminActionLoading.question ? 'Creating…' : 'Create question'}
              </button>
              {adminActionStatus.question ? (
                <p className="text-xs text-slate-300">{adminActionStatus.question}</p>
              ) : null}
            </form>
          </SectionCard>

          <SectionCard id="admin-create-flashcard" className="scroll-mt-28">
            <SectionTitle icon={Sparkles} title="Create flashcard" />
            <form
              className="mt-3 space-y-2"
              onSubmit={async (e) => {
                e.preventDefault()
                setAdminActionLoading((s) => ({ ...s, flashcard: true }))
                setAdminActionStatus((s) => ({ ...s, flashcard: '' }))
                try {
                  await apiClient.post(API.flashcards.list, {
                    courseId: flashcardForm.courseId.trim(),
                    front: flashcardForm.front.trim(),
                    back: flashcardForm.back.trim(),
                    source: flashcardForm.source.trim(),
                  })
                  setAdminActionStatus((s) => ({ ...s, flashcard: 'Flashcard created successfully.' }))
                  setFlashcardForm((v) => ({ ...v, front: '', back: '' }))
                } catch (err) {
                  const msg = err instanceof Error ? err.message : 'Failed to create flashcard.'
                  setAdminActionStatus((s) => ({ ...s, flashcard: msg }))
                } finally {
                  setAdminActionLoading((s) => ({ ...s, flashcard: false }))
                }
              }}
            >
              <input
                placeholder="Course ID"
                value={flashcardForm.courseId}
                onChange={(e) => setFlashcardForm((s) => ({ ...s, courseId: e.target.value }))}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                required
              />
              <textarea
                placeholder="Front"
                value={flashcardForm.front}
                onChange={(e) => setFlashcardForm((s) => ({ ...s, front: e.target.value }))}
                className="min-h-16 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-sm text-slate-100"
                required
              />
              <textarea
                placeholder="Back"
                value={flashcardForm.back}
                onChange={(e) => setFlashcardForm((s) => ({ ...s, back: e.target.value }))}
                className="min-h-16 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-sm text-slate-100"
                required
              />
              <button
                type="submit"
                disabled={adminActionLoading.flashcard}
                className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {adminActionLoading.flashcard ? 'Creating…' : 'Create flashcard'}
              </button>
              {adminActionStatus.flashcard ? (
                <p className="text-xs text-slate-300">{adminActionStatus.flashcard}</p>
              ) : null}
            </form>
          </SectionCard>

          <SectionCard id="admin-create-promo" className="scroll-mt-28">
            <SectionTitle icon={Shield} title="Create promo code" />
            <form
              className="mt-3 space-y-2"
              onSubmit={async (e) => {
                e.preventDefault()
                setAdminActionLoading((s) => ({ ...s, promo: true }))
                setAdminActionStatus((s) => ({ ...s, promo: '' }))
                const plan = String(promoForm.unlocksPlan || '').trim()
                const creditsRaw = String(promoForm.questionCredits || '').trim()
                const nCredits = creditsRaw ? Number(creditsRaw) : NaN
                const hasPlan = plan === 'basic' || plan === 'pro'
                const hasCredits = Number.isFinite(nCredits) && nCredits >= 1
                if (!hasPlan && !hasCredits) {
                  setAdminActionStatus((s) => ({
                    ...s,
                    promo: 'Choose a plan (basic/pro) and/or enter question credits (≥ 1).',
                  }))
                  setAdminActionLoading((s) => ({ ...s, promo: false }))
                  return
                }
                try {
                  await apiClient.post(API.admin.promo.codes, {
                    code: promoForm.code.trim(),
                    maxRedemptions: Number(promoForm.maxRedemptions),
                    ...(hasPlan ? { unlocksPlan: plan } : {}),
                    ...(hasCredits ? { questionCredits: Math.floor(nCredits) } : {}),
                    ...(promoForm.expiresAt
                      ? { expiresAt: new Date(promoForm.expiresAt).getTime() }
                      : {}),
                    ...(promoForm.creditExpiresAt
                      ? {
                          creditExpiresAt: new Date(promoForm.creditExpiresAt).getTime(),
                        }
                      : {}),
                  })
                  setAdminActionStatus((s) => ({ ...s, promo: 'Promo code created successfully.' }))
                  setPromoForm((v) => ({ ...v, code: '' }))
                } catch (err) {
                  const msg = err instanceof Error ? err.message : 'Failed to create promo code.'
                  setAdminActionStatus((s) => ({ ...s, promo: msg }))
                } finally {
                  setAdminActionLoading((s) => ({ ...s, promo: false }))
                }
              }}
            >
              <input
                placeholder="Code (e.g. WELCOME2026)"
                value={promoForm.code}
                onChange={(e) => setPromoForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                required
              />
              <select
                value={promoForm.unlocksPlan}
                onChange={(e) => setPromoForm((s) => ({ ...s, unlocksPlan: e.target.value }))}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
              >
                <option value="">No plan (credits-only)</option>
                <option value="basic">basic</option>
                <option value="pro">pro</option>
              </select>
              <input
                placeholder="Question credits (optional, ≥1)"
                value={promoForm.questionCredits}
                onChange={(e) => setPromoForm((s) => ({ ...s, questionCredits: e.target.value }))}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
              />
              <input
                placeholder="Max redemptions"
                value={promoForm.maxRedemptions}
                onChange={(e) => setPromoForm((s) => ({ ...s, maxRedemptions: e.target.value }))}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                required
              />
              <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Code expires
              </label>
              <input
                type="datetime-local"
                value={promoForm.expiresAt}
                onChange={(e) => setPromoForm((s) => ({ ...s, expiresAt: e.target.value }))}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
              />
              <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Credit grant expires (optional)
              </label>
              <input
                type="datetime-local"
                value={promoForm.creditExpiresAt}
                onChange={(e) => setPromoForm((s) => ({ ...s, creditExpiresAt: e.target.value }))}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
              />
              <button
                type="submit"
                disabled={adminActionLoading.promo}
                className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {adminActionLoading.promo ? 'Creating…' : 'Create promo code'}
              </button>
              {adminActionStatus.promo ? (
                <p className="text-xs text-slate-300">{adminActionStatus.promo}</p>
              ) : null}
            </form>
          </SectionCard>

          <SectionCard id="admin-upload-bundle" className="scroll-mt-28 xl:col-span-3">
            <SectionTitle icon={BookOpen} title="Upload question bundle (PDF + JSON)" />
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-400">
              Multipart <span className="font-mono">POST /questions/upload-bundle</span> with{' '}
              <span className="font-mono">courseId</span>, <span className="font-mono">pdf</span>, and{' '}
              <span className="font-mono">extracted</span> (JSON). Copy the course ID from{' '}
              <span className="text-slate-300">Admin → Catalog → Browse</span> (Courses table or selection summary).
            </p>
            <form
              className="mt-6 space-y-8"
              onSubmit={async (e) => {
                e.preventDefault()
                const cid = bundleUpload.courseId.trim()
                if (!cid || !bundleUpload.pdf || !bundleUpload.json) {
                  setBundleStatus('Course id, PDF, and JSON are required.')
                  return
                }
                setAdminActionLoading((s) => ({ ...s, bundle: true }))
                setBundleStatus('')
                try {
                  const fd = new FormData()
                  fd.append('courseId', cid)
                  fd.append('pdf', bundleUpload.pdf)
                  fd.append('extracted', bundleUpload.json)
                  await apiClient.post(API.questions.uploadBundle, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                  })
                  setBundleStatus('Bundle uploaded and applied.')
                  setBundleUpload((s) => ({ ...s, pdf: null, json: null }))
                  await queryClient.invalidateQueries({ queryKey: ['questions'] })
                } catch (err) {
                  const msg =
                    err?.response?.data?.message ||
                    (err instanceof Error ? err.message : 'Bundle upload failed.')
                  setBundleStatus(String(msg))
                } finally {
                  setAdminActionLoading((s) => ({ ...s, bundle: false }))
                }
              }}
            >
              <div className="space-y-3 border-b border-white/10 pb-8">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">1. Target course</p>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-slate-300">Course ID</span>
                  <input
                    placeholder="Paste course ID from the catalog (Courses table)"
                    value={bundleUpload.courseId}
                    onChange={(e) =>
                      setBundleUpload((s) => ({ ...s, courseId: e.target.value }))
                    }
                    className="h-12 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 font-mono text-sm text-slate-100"
                    required
                  />
                </label>
              </div>
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">2. Files</p>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="flex min-h-[88px] flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <span className="text-xs font-medium text-slate-300">Original PDF</span>
                    <span className="text-[11px] text-slate-500">Exam paper or source PDF</span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="mt-1 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-orange-500"
                      onChange={(e) =>
                        setBundleUpload((s) => ({
                          ...s,
                          pdf: e.target.files?.[0] ?? null,
                        }))
                      }
                    />
                  </label>
                  <label className="flex min-h-[88px] flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <span className="text-xs font-medium text-slate-300">Extracted JSON</span>
                    <span className="text-[11px] text-slate-500">Structured questions payload</span>
                    <input
                      type="file"
                      accept="application/json,.json"
                      className="mt-1 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-orange-500"
                      onChange={(e) =>
                        setBundleUpload((s) => ({
                          ...s,
                          json: e.target.files?.[0] ?? null,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={adminActionLoading.bundle}
                  className="order-2 min-h-11 w-full rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:opacity-60 sm:order-1 sm:w-auto sm:min-w-[200px]"
                >
                  {adminActionLoading.bundle ? 'Uploading…' : 'Upload bundle'}
                </button>
                {bundleStatus ? (
                  <p
                    className={`order-1 text-xs sm:order-2 sm:max-w-md sm:text-right ${bundleStatus.includes('failed') || bundleStatus.toLowerCase().includes('required') ? 'text-rose-400' : 'text-emerald-300'}`}
                  >
                    {bundleStatus}
                  </p>
                ) : (
                  <span className="order-1 hidden text-[11px] text-slate-500 sm:order-2 sm:inline">
                    PDF and JSON are required before upload.
                  </span>
                )}
              </div>
            </form>
          </SectionCard>
        </motion.section>
      ) : null}

      {isAdmin && adminPanel === 'manage' ? (
        <motion.section {...sectionMotion} id="admin-catalog" className="scroll-mt-24 grid gap-4 xl:grid-cols-2">
          <SectionCard className="xl:col-span-2">
            <SectionTitle icon={Building2} title="Institutions catalog" />
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Work top-down: pick a university, then college, department, and course (search fields or{' '}
              <span className="text-slate-400">click a row</span> in each table). Each table lists the children of your
              current selection. Use the copy control on IDs for API payloads and uploads.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCatalogManageView('browse')}
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                  catalogManageView === 'browse'
                    ? 'border-orange-500/50 bg-orange-500/15 text-orange-100'
                    : 'border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                <Table2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Browse &amp; directories
              </button>
              <button
                type="button"
                onClick={() => setCatalogManageView('create')}
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                  catalogManageView === 'create'
                    ? 'border-orange-500/50 bg-orange-500/15 text-orange-100'
                    : 'border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Add or edit records
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <EntityCombobox
                id="admin-university"
                label="University"
                placeholder="Search university"
                value={universityValue}
                search={institutionSearch}
                onSearchChange={setInstitutionSearch}
                onSelect={(item) => {
                  const id = item?.id != null ? String(item.id) : ''
                  setUniversityValue(id ? { ...item, id } : item)
                  setUniversityId(id)
                }}
                options={universities}
                loading={universitiesQ.isLoading}
              />
              <EntityCombobox
                id="admin-college"
                label="College"
                placeholder="Search college"
                value={collegeValue}
                search={collegeSearch}
                onSearchChange={setCollegeSearch}
                onSelect={(item) => {
                  const id = item?.id != null ? String(item.id) : ''
                  setCollegeValue(id ? { ...item, id } : item)
                  setCollegeId(id)
                }}
                options={colleges}
                loading={collegesQ.isLoading}
                disabled={!universityId}
              />
              <EntityCombobox
                id="admin-department"
                label="Department"
                placeholder="Search department"
                value={departmentValue}
                search={departmentSearch}
                onSearchChange={setDepartmentSearch}
                onSelect={(item) => {
                  const id = item?.id != null ? String(item.id) : ''
                  setDepartmentValue(id ? { ...item, id } : item)
                  setDepartmentId(id)
                }}
                options={departments}
                loading={departmentsQ.isLoading}
                disabled={!collegeId}
              />
              <EntityCombobox
                id="admin-course"
                label="Course"
                placeholder="Search course"
                value={courseValue}
                search={courseSearch}
                onSearchChange={setCourseSearch}
                onSelect={(item) => {
                  const id = item?.id != null ? String(item.id) : ''
                  setCourseValue(id ? { ...item, id } : item)
                  setCourseId(id)
                }}
                options={courses}
                loading={coursesQ.isLoading}
                disabled={!departmentId}
              />
            </div>

            {catalogManageView === 'create' ? (
              <>
                <p className="mt-5 text-xs leading-relaxed text-slate-400">
                  Use the pickers above so nested records attach to the right parent. Universities can be added without
                  selecting anything else first.
                </p>
                <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <form
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5"
                onSubmit={async (e) => {
                  e.preventDefault()
                  try {
                    if (universityForm.id) {
                      await updateUniversityM.mutateAsync({
                        id: universityForm.id,
                        payload: {
                          name: universityForm.name.trim(),
                          acronym: universityForm.acronym.trim(),
                          location: universityForm.location.trim(),
                          type: universityForm.type,
                          isActive: universityForm.isActive,
                        },
                      })
                      setCatalogStatus('University updated.')
                    } else {
                      await createUniversityM.mutateAsync({
                        name: universityForm.name.trim(),
                        acronym: universityForm.acronym.trim(),
                        location: universityForm.location.trim(),
                        type: universityForm.type,
                        isActive: universityForm.isActive,
                      })
                      setCatalogStatus('University created.')
                    }
                    setUniversityForm({
                      id: '',
                      name: '',
                      acronym: '',
                      location: '',
                      type: 'public',
                      isActive: true,
                    })
                  } catch (err) {
                    setCatalogStatus(catalogErrorMessage(err, 'Could not save university.'))
                  }
                }}
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {universityForm.id ? 'Edit university' : 'Create university'}
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    placeholder="Name"
                    value={universityForm.name}
                    onChange={(e) => setUniversityForm((s) => ({ ...s, name: e.target.value }))}
                    className="h-11 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                    required
                  />
                  <input
                    placeholder="Acronym"
                    value={universityForm.acronym}
                    onChange={(e) => setUniversityForm((s) => ({ ...s, acronym: e.target.value }))}
                    className="h-11 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                    required
                  />
                  <input
                    placeholder="Location"
                    value={universityForm.location}
                    onChange={(e) => setUniversityForm((s) => ({ ...s, location: e.target.value }))}
                    className="h-11 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                    required
                  />
                  <select
                    value={universityForm.type}
                    onChange={(e) => setUniversityForm((s) => ({ ...s, type: e.target.value }))}
                    className="h-11 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <button className="mt-3 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700">
                  {universityForm.id ? 'Update' : 'Create'}
                </button>
              </form>

              <form
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5"
                onSubmit={async (e) => {
                  e.preventDefault()
                  try {
                    const payload = {
                      name: collegeForm.name.trim(),
                      code: collegeForm.code.trim() || undefined,
                      universityId: collegeForm.universityId || universityId,
                      isActive: collegeForm.isActive,
                    }
                    if (collegeForm.id) {
                      await updateCollegeM.mutateAsync({ id: collegeForm.id, payload })
                      setCatalogStatus('College updated.')
                    } else {
                      await createCollegeM.mutateAsync(payload)
                      setCatalogStatus('College created.')
                    }
                    setCollegeForm({ id: '', name: '', code: '', universityId: universityId || '', isActive: true })
                  } catch (err) {
                    setCatalogStatus(catalogErrorMessage(err, 'Could not save college.'))
                  }
                }}
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {collegeForm.id ? 'Edit college' : 'Create college'}
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    placeholder="College name"
                    value={collegeForm.name}
                    onChange={(e) => setCollegeForm((s) => ({ ...s, name: e.target.value }))}
                    className="h-11 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                    required
                  />
                  <input
                    placeholder="College code (optional)"
                    value={collegeForm.code}
                    onChange={(e) => setCollegeForm((s) => ({ ...s, code: e.target.value }))}
                    className="h-11 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                  />
                </div>
                <button
                  disabled={!universityId && !collegeForm.universityId}
                  className="mt-3 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  {collegeForm.id ? 'Update' : 'Create'}
                </button>
              </form>

              <form
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5"
                onSubmit={async (e) => {
                  e.preventDefault()
                  try {
                    const payload = {
                      name: departmentForm.name.trim(),
                      code: departmentForm.code.trim() || undefined,
                      collegeId: departmentForm.collegeId || collegeId,
                      isActive: departmentForm.isActive,
                    }
                    if (departmentForm.id) {
                      await updateDepartmentM.mutateAsync({ id: departmentForm.id, payload })
                      setCatalogStatus('Department updated.')
                    } else {
                      await createDepartmentM.mutateAsync(payload)
                      setCatalogStatus('Department created.')
                    }
                    setDepartmentForm({ id: '', name: '', code: '', collegeId: collegeId || '', isActive: true })
                  } catch (err) {
                    setCatalogStatus(catalogErrorMessage(err, 'Could not save department.'))
                  }
                }}
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {departmentForm.id ? 'Edit department' : 'Create department'}
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    placeholder="Department name"
                    value={departmentForm.name}
                    onChange={(e) => setDepartmentForm((s) => ({ ...s, name: e.target.value }))}
                    className="h-11 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                    required
                  />
                  <input
                    placeholder="Department code (optional)"
                    value={departmentForm.code}
                    onChange={(e) => setDepartmentForm((s) => ({ ...s, code: e.target.value }))}
                    className="h-11 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                  />
                </div>
                <button
                  disabled={!collegeId && !departmentForm.collegeId}
                  className="mt-3 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  {departmentForm.id ? 'Update' : 'Create'}
                </button>
              </form>

              <form
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5"
                onSubmit={async (e) => {
                  e.preventDefault()
                  try {
                    const payload = {
                      name: courseFormState.name.trim(),
                      code: courseFormState.code.trim() || undefined,
                      deptId: courseFormState.deptId || departmentId,
                      isActive: courseFormState.isActive,
                    }
                    if (courseFormState.id) {
                      await updateCourseM.mutateAsync({ id: courseFormState.id, payload })
                      setCatalogStatus('Course updated.')
                    } else {
                      await createCourseM.mutateAsync(payload)
                      setCatalogStatus('Course created.')
                    }
                    setCourseFormState({ id: '', name: '', code: '', deptId: departmentId || '', isActive: true })
                  } catch (err) {
                    setCatalogStatus(catalogErrorMessage(err, 'Could not save course.'))
                  }
                }}
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {courseFormState.id ? 'Edit course' : 'Create course'}
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    placeholder="Course name"
                    value={courseFormState.name}
                    onChange={(e) => setCourseFormState((s) => ({ ...s, name: e.target.value }))}
                    className="h-11 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                    required
                  />
                  <input
                    placeholder="Course code (optional)"
                    value={courseFormState.code}
                    onChange={(e) => setCourseFormState((s) => ({ ...s, code: e.target.value }))}
                    className="h-11 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 text-sm text-slate-100"
                  />
                </div>
                <button
                  disabled={!departmentId && !courseFormState.deptId}
                  className="mt-3 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  {courseFormState.id ? 'Update' : 'Create'}
                </button>
              </form>
                </div>
              </>
            ) : (
              <>
                <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 sm:px-4">
                  <p className="text-xs font-medium text-slate-400">Current selection — copy IDs</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <CatalogSelectionChip label="University" name={universityValue?.name} id={universityId} />
                    <CatalogSelectionChip label="College" name={collegeValue?.name} id={collegeId} />
                    <CatalogSelectionChip label="Department" name={departmentValue?.name} id={departmentId} />
                    <CatalogSelectionChip label="Course" name={courseValue?.name} id={courseId} />
                  </div>
                  {!universityId && !collegeId && !departmentId && !courseId ? (
                    <p className="mt-2 text-[11px] text-slate-500">
                      Choose a university above to unlock college IDs, then continue down the chain.
                    </p>
                  ) : (
                    <p className="mt-2 text-[11px] text-slate-500">
                      The course ID is the one most tools need for uploads and integrations.
                    </p>
                  )}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <SelectField
                    label="Questions year"
                    value={year}
                    onChange={setYear}
                    options={['2026', '2025', '2024', '2023', '2022', '2021'].map((v) => ({
                      value: v,
                      label: v,
                    }))}
                  />
                  <SelectField
                    label="Questions level"
                    value={level}
                    onChange={setLevel}
                    options={['100', '200', '300', '400', '500'].map((v) => ({
                      value: v,
                      label: `Level ${v}`,
                    }))}
                  />
                  <SelectField
                    label="Questions type"
                    value={type}
                    onChange={setType}
                    options={QUESTION_TYPE_FILTER_OPTIONS}
                  />
                </div>

                <div className="mt-8 space-y-8">
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Universities directory
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
                          {[
                            { id: 'all', label: 'All' },
                            { id: 'active', label: 'Active' },
                            { id: 'inactive', label: 'Inactive' },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setUniversityStatusFilter(opt.id)}
                              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                                universityStatusFilter === opt.id
                                  ? 'bg-orange-500 text-white'
                                  : 'text-slate-300 hover:bg-white/10'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCatalogCard('universities')}
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10"
                        >
                          {collapsedCatalogCards.universities ? 'Expand' : 'Collapse'}
                          {collapsedCatalogCards.universities ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    {!collapsedCatalogCards.universities ? (
                      <DataTable
                        data={filteredUniversityRows}
                        columns={universityColumns}
                        loading={universitiesQ.isLoading}
                        searchable
                        sortable
                        emptyMessage="No universities found."
                        onRowClick={selectCatalogUniversity}
                      />
                    ) : null}
                  </div>
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Colleges</p>
                        <p className="text-[11px] text-slate-500">Scoped to the selected university · ID column is copyable</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
                          {[
                            { id: 'all', label: 'All' },
                            { id: 'active', label: 'Active' },
                            { id: 'inactive', label: 'Inactive' },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setCollegeStatusFilter(opt.id)}
                              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                                collegeStatusFilter === opt.id
                                  ? 'bg-orange-500 text-white'
                                  : 'text-slate-300 hover:bg-white/10'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCatalogCard('colleges')}
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10"
                        >
                          {collapsedCatalogCards.colleges ? 'Expand' : 'Collapse'}
                          {collapsedCatalogCards.colleges ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    {!collapsedCatalogCards.colleges ? (
                      <DataTable
                        data={filteredCollegeRows}
                        columns={collegeColumns}
                        loading={collegesQ.isLoading}
                        searchable
                        sortable
                        emptyMessage={universityId ? 'No colleges found for this university.' : 'Select a university to load colleges.'}
                        onRowClick={universityId ? selectCatalogCollege : undefined}
                      />
                    ) : null}
                  </div>
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Departments</p>
                        <p className="text-[11px] text-slate-500">Scoped to the selected college</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
                          {[
                            { id: 'all', label: 'All' },
                            { id: 'active', label: 'Active' },
                            { id: 'inactive', label: 'Inactive' },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setDepartmentStatusFilter(opt.id)}
                              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                                departmentStatusFilter === opt.id
                                  ? 'bg-orange-500 text-white'
                                  : 'text-slate-300 hover:bg-white/10'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCatalogCard('departments')}
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10"
                        >
                          {collapsedCatalogCards.departments ? 'Expand' : 'Collapse'}
                          {collapsedCatalogCards.departments ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    {!collapsedCatalogCards.departments ? (
                      <DataTable
                        data={filteredDepartmentRows}
                        columns={departmentColumns}
                        loading={departmentsQ.isLoading}
                        searchable
                        sortable
                        emptyMessage={collegeId ? 'No departments found for this college.' : 'Select a college to load departments.'}
                        onRowClick={collegeId ? selectCatalogDepartment : undefined}
                      />
                    ) : null}
                  </div>
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Courses</p>
                        <p className="text-[11px] text-slate-500">Scoped to the selected department · use this course ID for bundle upload</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
                          {[
                            { id: 'all', label: 'All' },
                            { id: 'active', label: 'Active' },
                            { id: 'inactive', label: 'Inactive' },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setCourseStatusFilter(opt.id)}
                              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                                courseStatusFilter === opt.id
                                  ? 'bg-orange-500 text-white'
                                  : 'text-slate-300 hover:bg-white/10'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCatalogCard('courses')}
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10"
                        >
                          {collapsedCatalogCards.courses ? 'Expand' : 'Collapse'}
                          {collapsedCatalogCards.courses ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    {!collapsedCatalogCards.courses ? (
                      <DataTable
                        data={filteredCourseRows}
                        columns={courseColumns}
                        loading={coursesQ.isLoading}
                        searchable
                        sortable
                        emptyMessage={departmentId ? 'No courses found for this department.' : 'Select a department to load courses.'}
                        onRowClick={departmentId ? selectCatalogCourse : undefined}
                      />
                    ) : null}
                  </div>

                  {courseId ? (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-100">
                          Course content preview ({courseValue?.name || 'selected course'})
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300">
                            {questionsQ.data?.length ?? 0} past questions
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300">
                            {questionTypeMix.length || 1} quiz set{questionTypeMix.length === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Click course row above to load this section. Quiz sets are generated from available question types.
                      </p>
                      {questionsQ.isLoading ? (
                        <div className="mt-3 space-y-2">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <SkeletonNotificationRow key={`admin-course-content-skeleton-${i}`} />
                          ))}
                        </div>
                      ) : questionsQ.data?.length ? (
                        <>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                              href={buildQuizHref({
                                courseId,
                                year,
                                level,
                                type: 'all',
                                mode: 'quiz',
                                ...(courseValue?.name?.trim() ? { courseName: courseValue.name.trim() } : {}),
                              })}
                              className="inline-flex items-center gap-1 rounded-lg border border-teal-500/40 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-200 hover:bg-teal-500/20"
                            >
                              <Target className="h-3.5 w-3.5" />
                              Mixed quiz
                            </Link>
                            {questionTypeMix.map(({ type: t }) => (
                              <Link
                                key={`quiz-type-${t}`}
                                href={buildQuizHref({
                                  courseId,
                                  year,
                                  level,
                                  type: t,
                                  mode: 'quiz',
                                  ...(courseValue?.name?.trim() ? { courseName: courseValue.name.trim() } : {}),
                                })}
                                className="inline-flex items-center gap-1 rounded-lg border border-orange-500/35 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold capitalize text-orange-200 hover:bg-orange-500/20"
                              >
                                <ListOrdered className="h-3.5 w-3.5" />
                                {t} quiz
                              </Link>
                            ))}
                          </div>
                          <div className="mt-4 grid gap-3">
                            {(questionsQ.data || []).slice(0, 6).map((q, idx) => (
                              <CourseQuestionCard
                                key={`admin-preview-${q.id}`}
                                question={q}
                                index={idx}
                                adminClearSolutions={{
                                  onClear: () => clearQuestionSolutionsM.mutate(q.id),
                                  pending:
                                    clearQuestionSolutionsM.isPending &&
                                    clearQuestionSolutionsM.variables === q.id,
                                }}
                              />
                            ))}
                            {questionsQ.data.length > 6 ? (
                              <p className="text-xs text-slate-500">
                                Showing 6 of {questionsQ.data.length} past questions. Open quiz or filters for full set.
                              </p>
                            ) : null}
                          </div>
                        </>
                      ) : (
                        <p className="mt-3 text-sm text-slate-400">
                          No past questions matched this course for Year {year}, Level {level}, and type{' '}
                          {QUESTION_TYPE_FILTER_OPTIONS.find((o) => o.value === type)?.label || type}.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              </>
            )}

            {catalogStatus ? (
              <p className="mt-4 text-xs text-slate-300">{catalogStatus}</p>
            ) : null}
          </SectionCard>

          <SectionCard id="admin-promo-list" className="scroll-mt-28">
            <SectionTitle icon={Shield} title="Promo codes" />
            {promoCodesQ.isLoading ? (
              <div className="mt-3 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonNotificationRow key={`promo-codes-skeleton-${i}`} />
                ))}
              </div>
            ) : promoCodesQ.isError ? (
              <p className="mt-3 text-sm text-rose-600">Could not load promo codes.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {promoCodesQ.data.slice(0, 8).map((row) => {
                  const rec = asRecord(row) || {}
                  const id = typeof rec.id === 'string' ? rec.id : ''
                  const code = typeof rec.code === 'string' ? rec.code : '—'
                  const plan = typeof rec.unlocksPlan === 'string' ? rec.unlocksPlan : '—'
                  const active = rec.active !== false
                  return (
                    <div
                      key={id || code}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-slate-100">{code}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          plan: {plan} · {active ? 'active' : 'inactive'}
                        </p>
                      </div>
                      {active && id ? (
                        <button
                          type="button"
                          disabled={deactivatePromoM.isPending}
                          onClick={() => deactivatePromoM.mutate(id)}
                          className="rounded-md border border-rose-300 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                        >
                          Deactivate
                        </button>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard id="admin-upload-queue" className="scroll-mt-28">
            <SectionTitle icon={BookOpen} title="Question upload queue" />
            {uploadQueueQ.isLoading ? (
              <div className="mt-3 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonQuestionCard key={`upload-queue-skeleton-${i}`} />
                ))}
              </div>
            ) : uploadQueueQ.isError ? (
              <p className="mt-3 text-sm text-rose-600">Could not load upload queue.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {uploadQueueQ.data.slice(0, 8).map((row, idx) => {
                  const rec = asRecord(row) || {}
                  const hasServerId =
                    typeof rec.id === 'string' || typeof rec._id === 'string'
                  const id =
                    typeof rec.id === 'string'
                      ? rec.id
                      : typeof rec._id === 'string'
                        ? rec._id
                        : `queue-${idx}`
                  const status =
                    typeof rec.status === 'string'
                      ? rec.status
                      : typeof rec.state === 'string'
                        ? rec.state
                        : 'queued'
                  const filename =
                    typeof rec.filename === 'string'
                      ? rec.filename
                      : typeof rec.fileName === 'string'
                        ? rec.fileName
                        : typeof rec.name === 'string'
                          ? rec.name
                          : 'upload item'
                  const previewLoading =
                    uploadQueuePreviewM.isPending && uploadQueuePreviewM.variables === id
                  return (
                    <div
                      key={id}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                    >
                      <p className="font-medium text-slate-100">{filename}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">status: {status}</p>
                      {hasServerId ? (
                        <div className="mt-2">
                          <button
                            type="button"
                            disabled={previewLoading}
                            onClick={async () => {
                              setUploadPreviewFeedback(null)
                              try {
                                const data = await uploadQueuePreviewM.mutateAsync(id)
                                const url = pickFirstHttpUrl(data)
                                if (url) {
                                  window.open(url, '_blank', 'noopener,noreferrer')
                                } else {
                                  setUploadPreviewFeedback({
                                    id,
                                    text: 'Preview loaded but no file URL was found in the response.',
                                  })
                                }
                              } catch (e) {
                                const msg =
                                  e?.response?.data?.message ||
                                  (e instanceof Error ? e.message : 'Preview request failed.')
                                setUploadPreviewFeedback({ id, text: String(msg) })
                              }
                            }}
                            className="rounded-md border border-white/15 bg-white/[0.06] px-2 py-1 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {previewLoading ? 'Loading…' : 'Preview'}
                          </button>
                          {uploadPreviewFeedback?.id === id ? (
                            <p className="mt-1 text-xs text-amber-200/90">{uploadPreviewFeedback.text}</p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </motion.section>
      ) : null}

      {false && !isAdmin ? (
      <motion.div {...sectionMotion} id="past-questions" className="scroll-mt-24">
      <SectionCard>
        <div className="mb-4">
          <SectionTitle icon={BookOpen} title="Past questions" />
        </div>
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
            label="Question type"
            value={type}
            onChange={setType}
            options={QUESTION_TYPE_FILTER_OPTIONS}
          />
        </div>

        {!courseId ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Select a course to load questions.
          </p>
        ) : questionsQ.isLoading ? (
          <div className="mt-4 grid gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonQuestionCard key={`legacy-questions-skeleton-${i}`} />
            ))}
          </div>
        ) : questionsQ.isError ? (
          <p className="mt-4 text-sm text-rose-500">
            Could not load questions. Try All types or adjust year and level.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {(questionsQ.data || []).map((q) => (
              <article
                key={q.id}
                className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 transition hover:border-orange-300 hover:bg-orange-50/50 dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-orange-900/40 dark:hover:bg-orange-950/10"
              >
                <p className="line-clamp-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {q.questionText}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 font-semibold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-200">
                    {q.type || '—'}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 font-medium text-slate-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-300">
                    Year {q.year || '—'}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 font-medium text-slate-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-300">
                    Level {q.level || '—'}
                  </span>
                </div>
              </article>
            ))}
            {questionsQ.data?.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                No questions matched this course/filter combination.
              </p>
            ) : null}
          </div>
        )}
      </SectionCard>
      </motion.div>
      ) : null}

      {false && !isAdmin ? (
      <motion.div {...sectionMotion} id="notifications" className="scroll-mt-24">
      <SectionCard>
        <SectionTitle icon={Bell} title="Recent notifications" />
        {notificationsQ.isLoading ? (
          <div className="mt-3 space-y-2">
            <div className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-neutral-800" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-neutral-800" />
          </div>
        ) : notificationsQ.isError ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Notifications endpoint unavailable.
          </p>
        ) : notificationsQ.data?.length ? (
          <ul className="mt-3 space-y-2">
            {notificationsQ.data.map((note) => (
              <li
                key={note.id}
                className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900/40"
              >
                <p className="text-slate-800 dark:text-slate-100">{note.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{note.createdAt || ''}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No notifications found.</p>
        )}
      </SectionCard>
      </motion.div>
      ) : null}
    </div>
  )
}
