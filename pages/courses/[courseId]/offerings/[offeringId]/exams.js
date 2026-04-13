import Link from 'next/link'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../../../components/ProtectedRoute'
import Layout from '../../../../../components/Layout'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { useStudentProfile } from '@/hooks/students/useStudentProfile'
import { buildQuizHref } from '@/lib/quiz/build-quiz-href'

export default function OfferingExamsPage() {
  return (
    <ProtectedRoute>
      <Layout title="Exams">
        <ExamsContent />
      </Layout>
    </ProtectedRoute>
  )
}

function ExamsContent() {
  const router = useRouter()
  const courseId = typeof router.query.courseId === 'string' ? router.query.courseId : ''
  const offeringId = typeof router.query.offeringId === 'string' ? router.query.offeringId : ''
  const profileQ = useStudentProfile()
  const year = String(new Date().getFullYear())
  const level = String(profileQ.data?.levelData || 300)
  const quizHref = buildQuizHref({
    courseId: String(courseId),
    year,
    level,
    offeringId: String(offeringId),
    type: 'all',
    sourceLabel: 'Offering final exams',
    mode: 'quiz',
    count: 40,
    mins: 90,
  })
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <Breadcrumb
        items={[
          { label: 'My Courses', href: '/courses' },
          { label: 'Course', href: `/courses/${courseId}` },
          { label: 'Offerings', href: `/courses/${courseId}/offerings` },
          { label: 'Offering detail', href: `/courses/${courseId}/offerings/${offeringId}` },
          { label: 'Final exams' },
        ]}
      />
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Final exams</h1>
      <p className="mt-1 text-sm text-slate-600">Start practice from this offering exam set.</p>
      <Link href={quizHref} className="mt-3 inline-block text-sm font-medium text-orange-700">
        Practice
      </Link>
    </section>
  )
}
