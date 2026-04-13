import Link from 'next/link'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../components/ProtectedRoute'
import Layout from '../../../components/Layout'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { useStudentProfile } from '@/hooks/students/useStudentProfile'
import { buildQuizHref } from '@/lib/quiz/build-quiz-href'

export default function CourseOfferingsPage() {
  return (
    <ProtectedRoute>
      <Layout title="Course Offerings">
        <OfferingsContent />
      </Layout>
    </ProtectedRoute>
  )
}

function OfferingsContent() {
  const router = useRouter()
  const courseId = typeof router.query.courseId === 'string' ? router.query.courseId : ''
  const profileQ = useStudentProfile()
  const year = String(new Date().getFullYear())
  const level = String(profileQ.data?.levelData || 300)
  const quickQuizHref = buildQuizHref({
    courseId: String(courseId),
    year,
    level,
    type: 'all',
    sourceLabel: 'Course offerings',
    mode: 'quiz',
    count: 20,
    mins: 30,
  })

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <Breadcrumb
        items={[
          { label: 'My Courses', href: '/courses' },
          { label: 'Course', href: `/courses/${courseId}` },
          { label: 'Offerings' },
        ]}
      />
      <h1 className="text-lg font-semibold text-slate-900">Academic Year Offerings</h1>
      <p className="mt-2 text-sm text-slate-600">
        Detailed offering breakdown is being wired. You can still start practice from this course now.
      </p>
      <div className="mt-4 flex gap-3">
        <Link href={`/courses/${courseId}`} className="text-sm font-medium text-orange-700 hover:text-orange-800">
          Back to course
        </Link>
        <Link href={quickQuizHref} className="text-sm font-medium text-orange-700 hover:text-orange-800">
          Start new quiz
        </Link>
      </div>
    </section>
  )
}
