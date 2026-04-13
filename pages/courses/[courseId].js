import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQueries, useQuery } from '@tanstack/react-query'
import ProtectedRoute from '../../components/ProtectedRoute'
import Layout from '../../components/Layout'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { useStudentProfile } from '@/hooks/students/useStudentProfile'
import { useMyCourseDetail } from '@/hooks/students/useMyCourseDetail'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { useAuthStore } from '@/stores/auth.store'
import { sessionHasAdminTools } from '@/lib/session-admin-access'
import { buildQuizHref } from '@/lib/quiz/build-quiz-href'
import { normalizeStudentLevel } from '@/lib/courses/normalize-student-level'
import UploadFab from '../../components/UploadFab'

export default function CourseDetailPage() {
  return (
    <ProtectedRoute>
      <Layout title="Course Detail">
        <CourseDetailContent />
      </Layout>
    </ProtectedRoute>
  )
}

function CourseDetailContent() {
  const router = useRouter()
  const courseId = typeof router.query.courseId === 'string' ? router.query.courseId : ''
  const profileQ = useStudentProfile()
  const sessionUser = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAdmin = sessionHasAdminTools(sessionUser, accessToken)

  const year = String(new Date().getFullYear())
  const level = normalizeStudentLevel(profileQ.data?.levelData ?? 300)

  const myCourseQ = useMyCourseDetail(courseId, { year, level })

  const fallbackCourseQ = useQuery({
    queryKey: ['institutions-course', courseId],
    enabled: Boolean(courseId) && myCourseQ.isError,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get(API.institutions.courses.detail(courseId), { signal })
      return data || null
    },
  })

  const detail = myCourseQ.data || null
  const fallback = fallbackCourseQ.data || null
  const courseName = detail?.name || fallback?.name || ''
  const code = detail?.code ?? fallback?.code

  const needsLegacyStats = Boolean(courseId) && !detail && Boolean(fallback)
  const statsQueries = useQueries({
    queries: [
      {
        queryKey: ['course-questions', courseId, year, level],
        enabled: needsLegacyStats,
        queryFn: async ({ signal }) => {
          const { data } = await apiClient.get(API.questions.byCourse(courseId), {
            signal,
            params: { year, level: String(level) },
          })
          return Array.isArray(data) ? data.length : 0
        },
      },
      {
        queryKey: ['course-slides', courseId],
        enabled: needsLegacyStats,
        queryFn: async ({ signal }) => {
          const { data } = await apiClient.get(API.slides.byCourse(courseId), { signal })
          return Array.isArray(data) ? data.length : 0
        },
      },
    ],
  })

  const questionCount =
    detail?.questionCount ?? (needsLegacyStats ? statsQueries[0].data || 0 : 0)
  const slidesCount =
    detail?.slidesCount ?? (needsLegacyStats ? statsQueries[1].data || 0 : 0)

  const slices = [
    { key: 'slides', label: 'Slides', action: 'Study', route: `/courses/${courseId}/offerings` },
    {
      key: 'midsem',
      label: 'Midsem',
      action: 'Practice',
      route: buildQuizHref({
        courseId: String(courseId),
        year: String(year),
        level: String(level),
        type: 'all',
        courseName,
        sourceLabel: 'Midsem',
        mode: 'quiz',
        count: 25,
        mins: 45,
      }),
    },
    {
      key: 'final',
      label: 'Final',
      action: 'Practice',
      route: buildQuizHref({
        courseId: String(courseId),
        year: String(year),
        level: String(level),
        type: 'all',
        courseName,
        sourceLabel: 'Final exams',
        mode: 'quiz',
        count: 40,
        mins: 90,
      }),
    },
  ]

  const loading =
    myCourseQ.isPending || (myCourseQ.isError && fallbackCourseQ.isPending)
  const showError = myCourseQ.isError && fallbackCourseQ.isError

  return (
    <div className="space-y-5">
      <div>
        <Breadcrumb
          items={[
            { label: 'My Courses', href: '/courses' },
            { label: courseName || 'Course' },
          ]}
        />
        <Link href="/courses" className="text-sm font-semibold text-orange-600 underline-offset-2 hover:text-orange-700 hover:underline">
          Back to My Courses
        </Link>
        {loading ? (
          <p className="mt-2 text-sm text-slate-500">Loading course…</p>
        ) : null}
        {showError ? (
          <p className="mt-2 text-sm text-rose-700">
            Could not load this course. It may be outside your department or unavailable.
          </p>
        ) : null}
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {code ? `${code} — ` : ''}
          {courseName || 'Course'}
        </h1>
        <p className="mt-1 text-sm text-slate-700">
          Level {level} · Semester 1
          {detail?.departmentName ? ` · ${detail.departmentName}` : ''}
        </p>
        {detail?.descriptionShort ? (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{detail.descriptionShort}</p>
        ) : null}
        {detail?.isDecommissioned || detail?.statusMessage ? (
          <div
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
            role="alert"
          >
            {detail.statusMessage ||
              'This course or exam track may have been updated — confirm with your lecturer.'}
          </div>
        ) : null}
      </div>

      {!loading && !showError ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <Link
              href={buildQuizHref({
                courseId: String(courseId),
                year: String(year),
                level: String(level),
                type: 'all',
                courseName,
                mode: 'review',
              })}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Practice all
            </Link>
            <Link
              href={buildQuizHref({
                courseId: String(courseId),
                year: String(year),
                level: String(level),
                type: 'all',
                courseName,
                mode: 'quiz',
                count: 20,
                mins: 30,
              })}
              className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Generate quiz
            </Link>
          </div>

          {detail?.courseIncludes ? (
            <p className="mt-4 text-sm text-slate-600">
              {detail.courseIncludes.lessonCount} lessons · {detail.courseIncludes.instructorLabel}
            </p>
          ) : null}

          <div className="mt-5 rounded-xl border border-slate-100">
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
              {year}/{Number(year) + 1}
            </div>
            <ul className="divide-y divide-slate-100">
              {slices.map((slice) => (
                <li key={slice.key} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{slice.label}</p>
                    <p className="text-xs text-slate-500">
                      {slice.key === 'slides' ? `${slidesCount} decks` : `${questionCount} questions`}
                    </p>
                  </div>
                  <Link href={slice.route} className="text-sm font-medium text-orange-700 hover:text-orange-800">
                    {slice.action}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {detail?.lessons && detail.lessons.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Course content</h2>
              <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-100">
                {detail.lessons
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((lesson) => (
                    <li key={lesson.id} className="flex items-center justify-between px-4 py-2 text-sm">
                      <span className="text-slate-800">{lesson.title}</span>
                      <span className="text-slate-400" aria-label={lesson.isCompleted ? 'Completed' : 'Not completed'}>
                        {lesson.isCompleted ? '✓' : '○'}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
      {isAdmin ? <UploadFab /> : null}
    </div>
  )
}
