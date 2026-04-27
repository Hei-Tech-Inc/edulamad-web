import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';
import { useStudentProfile } from '@/hooks/students/useStudentProfile';
import { useMyCoursesInfinite } from '@/hooks/students/useMyCourses';
import { usePersonalisationStore } from '@/stores/personalisation.store';

function currentYear() {
  return String(new Date().getFullYear())
}

export default function QuizDiscoverPage() {
  return (
    <ProtectedRoute>
      <Layout title="Discover quizzes">
        <QuizDiscoverContent />
      </Layout>
    </ProtectedRoute>
  );
}

function QuizDiscoverContent() {
  const profileQ = useStudentProfile()
  const currentSemesterCourseIds = usePersonalisationStore((s) => s.currentSemesterCourseIds)
  const level = Number(profileQ.data?.levelData || 300)
  const coursesQ = useMyCoursesInfinite({
    year: currentYear(),
    level,
    limit: 18,
    sort: 'questions_desc',
    status: 'all',
    content: 'all',
    search: '',
  })

  const rows = coursesQ.data?.pages.flatMap((page) => page.data) ?? []
  const mySemesterSet = new Set(currentSemesterCourseIds)
  const mySemesterCourses = rows.filter((row) => mySemesterSet.has(row.courseId))
  const allCourses = rows

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
        <h1 className="text-xl font-semibold text-slate-900">Quiz discovery</h1>
        <p className="mt-1 text-sm text-slate-600">Pick from your courses and launch a quiz in one tap.</p>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">Quick start</h2>
          <Link href="/quiz/new" className="text-xs font-semibold text-orange-700 hover:text-orange-800">
            Advanced setup
          </Link>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {coursesQ.isLoading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <div key={`discover-quick-skeleton-${idx}`} className="h-20 animate-pulse rounded-xl bg-slate-100" />
              ))
            : mySemesterCourses.slice(0, 3).map((course) => (
                <Link
                  key={course.courseId}
                  href={`/quiz/new?courseId=${encodeURIComponent(course.courseId)}&year=${encodeURIComponent(currentYear())}&level=${encodeURIComponent(String(level))}`}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 hover:bg-orange-50/70"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {course.code ? `${course.code} — ` : ''}
                    {course.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">Start quiz</p>
                </Link>
              ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">All course quizzes</h2>
        {coursesQ.isError ? <p className="mt-3 text-sm text-rose-700">Could not load quiz options right now.</p> : null}
        {!coursesQ.isLoading && !allCourses.length ? (
          <p className="mt-3 text-sm text-slate-600">No courses found for your current level yet.</p>
        ) : null}
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {allCourses.map((course) => (
            <Link
              key={course.courseId}
              href={`/quiz/new?courseId=${encodeURIComponent(course.courseId)}&year=${encodeURIComponent(currentYear())}&level=${encodeURIComponent(String(level))}`}
              className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 hover:bg-slate-100"
            >
              <p className="text-sm font-semibold text-slate-900">
                {course.code ? `${course.code} — ` : ''}
                {course.name}
              </p>
              <p className="mt-1 text-xs text-slate-600">{course.questionCount || 0} questions available</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
