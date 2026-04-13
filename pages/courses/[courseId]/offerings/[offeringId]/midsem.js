import Link from 'next/link'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../../../components/ProtectedRoute'
import Layout from '../../../../../components/Layout'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { useStudentProfile } from '@/hooks/students/useStudentProfile'
import { buildQuizHref } from '@/lib/quiz/build-quiz-href'

export default function OfferingMidsemPage() {
  return (
    <ProtectedRoute>
      <Layout title="Midsem">
        <MidsemContent />
      </Layout>
    </ProtectedRoute>
  )
}

function MidsemContent() {
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
    sourceLabel: 'Offering midsem',
    mode: 'quiz',
    count: 25,
    mins: 45,
  })
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <Breadcrumb
        items={[
          { label: 'My Courses', href: '/courses' },
          { label: 'Course', href: `/courses/${courseId}` },
          { label: 'Offerings', href: `/courses/${courseId}/offerings` },
          { label: 'Offering detail', href: `/courses/${courseId}/offerings/${offeringId}` },
          { label: 'Midsem' },
        ]}
      />
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Interim assessments</h1>
      <p className="mt-1 text-sm text-slate-600">Start practice from this midsem set.</p>
      <Link href={quizHref} className="mt-3 inline-block text-sm font-medium text-orange-700">
        Practice
      </Link>
    </section>
  )
}
