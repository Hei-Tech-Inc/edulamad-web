import { useMemo, useState } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import Layout from '../../components/Layout'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useStudentProfile } from '@/hooks/students/useStudentProfile'
import { useCourseSearch } from '@/hooks/institutions/useInstitutionsCatalog'

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

  const coursesQ = useCourseSearch(profile?.deptId || null, '', true)
  const courses = useMemo(() => coursesQ.data ?? [], [coursesQ.data])
  const selectedCourse = useMemo(
    () => courses.find((c) => String(c.id) === String(courseId)),
    [courses, courseId],
  )

  const launchQuiz = () => {
    if (!courseId || !year || !level) return
    const payload = {
      courseId: String(courseId),
      year: String(year),
      level: String(level),
      type: String(type || 'all'),
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
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.code ? `${c.code} — ` : ''}
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Year</span>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            />
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

      <div className="mt-5">
        <button
          type="button"
          onClick={launchQuiz}
          disabled={!courseId || !year || !level}
          className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Start quiz
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
