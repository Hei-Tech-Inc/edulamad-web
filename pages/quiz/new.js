import { useMemo, useState } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import Layout from '../../components/Layout'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery, useQueries } from '@tanstack/react-query'
import { useStudentProfile } from '@/hooks/students/useStudentProfile'
import { useCourseTags } from '@/hooks/tags/useTags'
import { Loader2 } from 'lucide-react'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'

function pickArray(value) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const rec = value
  for (const key of ['data', 'items', 'results', 'rows', 'questions']) {
    if (Array.isArray(rec[key])) return rec[key]
  }
  return []
}

function buildYearRange() {
  const now = new Date().getFullYear()
  return Array.from({ length: 8 }, (_, i) => String(now - i))
}

function QuizNewRouteInner() {
  const router = useRouter()
  const profileQ = useStudentProfile()
  const profile = profileQ.data
  const [courseId, setCourseId] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [level, setLevel] = useState('300')
  const [type, setType] = useState('all')
  const [count, setCount] = useState('20')
  const [mins, setMins] = useState('30')
  const [selectedTag, setSelectedTag] = useState('')

  const yearCandidates = useMemo(buildYearRange, [])

  const coursesQ = useQuery({
    queryKey: ['quiz-new', 'my-courses', year, level],
    enabled: Boolean(profile?.deptId && year && level),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get(API.students.meCourses, {
        signal,
        params: {
          page: 1,
          limit: 100,
          year,
          level: Number(level),
          sort: 'questions_desc',
        },
      })
      return pickArray(data)
    },
  })
  const courses = useMemo(
    () =>
      (coursesQ.data ?? []).filter(
        (row) => Number(row?.questionCount || 0) > 0 && typeof row?.courseId === 'string',
      ),
    [coursesQ.data],
  )
  const selectedCourse = useMemo(
    () => courses.find((c) => String(c.courseId) === String(courseId)),
    [courses, courseId],
  )
  const courseTagsQ = useCourseTags(courseId || null)

  const yearAvailabilityQs = useQueries({
    queries: yearCandidates.map((yy) => ({
      queryKey: ['quiz-new', 'year-availability', courseId, level, yy],
      enabled: Boolean(courseId && level),
      queryFn: async ({ signal }) => {
        const { data } = await apiClient.get(API.questions.byCourse(courseId), {
          signal,
          params: { year: yy, level },
        })
        return { year: yy, count: pickArray(data).length }
      },
      staleTime: 60_000,
    })),
  })

  const yearAvailability = useMemo(() => {
    const out = {}
    for (const q of yearAvailabilityQs) {
      const row = q.data
      if (row?.year) out[row.year] = row.count
    }
    return out
  }, [yearAvailabilityQs])

  const availableYears = useMemo(
    () => yearCandidates.filter((yy) => Number(yearAvailability[yy] || 0) > 0),
    [yearCandidates, yearAvailability],
  )

  const yearAvailabilityLoading = yearAvailabilityQs.some((q) => q.isLoading)

  const selectedYearCount = Number(yearAvailability[year] || 0)

  const autoPickedYear = useMemo(() => {
    if (selectedYearCount > 0) return year
    return availableYears[0] || year
  }, [selectedYearCount, year, availableYears])

  const yearLooksInvalidForCourse = Boolean(courseId) && selectedYearCount === 0 && availableYears.length > 0

  const launchQuiz = () => {
    if (!courseId || !autoPickedYear || !level) return
    const payload = {
      courseId: String(courseId),
      year: String(autoPickedYear),
      level: String(level),
      type: String(type || 'all'),
      ...(selectedTag ? { tagId: selectedTag } : {}),
      courseName: selectedCourse?.name || '',
      mode: 'quiz',
      count: Number.parseInt(count, 10) || 20,
      seed: Math.floor(Math.random() * 2147483647),
      mins: Number.parseInt(mins, 10) || 30,
    }
    const id = encodeURIComponent(JSON.stringify(payload))
    void router.push(`/quiz/${id}`)
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Start new quiz</h1>
      <p className="mt-1 text-sm text-slate-600">Choose course and settings to generate a quiz session.</p>

      {!profile ? (
        <p className="mt-4 text-sm text-slate-600">
          Complete profile setup first so we can scope quiz content to your department.
          <Link href="/onboarding" className="ml-2 font-semibold text-orange-700">
            Go to onboarding
          </Link>
        </p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Course</span>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">
                {coursesQ.isLoading ? 'Loading courses…' : 'Select a course with available questions'}
              </option>
              {courses.map((c) => (
                <option key={c.courseId} value={String(c.courseId)}>
                  {c.code ? `${c.code} — ` : ''}
                  {c.name} ({Number(c.questionCount || 0)} questions)
                </option>
              ))}
            </select>
            {coursesQ.isError ? (
              <p className="text-xs text-rose-600">Could not load courses for this year/level.</p>
            ) : null}
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Year</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            >
              {yearCandidates.map((yy) => {
                const n = Number(yearAvailability[yy] || 0)
                return (
                  <option key={yy} value={yy}>
                    {yy} ({n} question{n === 1 ? '' : 's'})
                  </option>
                )
              })}
            </select>
            {courseId ? (
              <p className="text-xs text-slate-600">
                {yearAvailabilityLoading ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Checking available years…
                  </span>
                ) : availableYears.length ? (
                  <>
                    Available years for this course: {availableYears.join(', ')}
                    {yearLooksInvalidForCourse ? ` (suggested: ${availableYears[0]})` : ''}
                  </>
                ) : (
                  'No questions found for this course across recent years.'
                )}
              </p>
            ) : null}
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Level</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            >
              {['100', '200', '300', '400', '500'].map((v) => (
                <option key={v} value={v}>
                  Level {v}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            >
              {['all', 'theory', 'objective', 'practical', 'essay', 'mcq'].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Questions</span>
            <input
              type="number"
              min={1}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Minutes</span>
            <input
              type="number"
              min={0}
              value={mins}
              onChange={(e) => setMins(e.target.value)}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            />
          </label>
        </div>
      )}

      {courseId && courseTagsQ.data?.length ? (
        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500">Filter by topic</p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedTag('')}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium ${
                !selectedTag
                  ? 'border-orange-300 bg-orange-50 text-orange-800'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              All topics
            </button>
            {courseTagsQ.data.map((tag) => (
              <button
                key={tag._id}
                type="button"
                onClick={() => setSelectedTag((prev) => (prev === tag._id ? '' : tag._id))}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium ${
                  selectedTag === tag._id
                    ? 'border-sky-300 bg-sky-50 text-sky-800'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <button
          type="button"
          onClick={launchQuiz}
          disabled={!courseId || !autoPickedYear || !level || selectedYearCount <= 0}
          className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Start quiz{selectedYearCount > 0 ? ` (${selectedYearCount} available)` : ''}
        </button>
      </div>
    </section>
  )
}

export default function QuizNewRoute() {
  return (
    <ProtectedRoute>
      <Layout title="Practice">
        <QuizNewRouteInner />
      </Layout>
    </ProtectedRoute>
  )
}
