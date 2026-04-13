import Link from 'next/link'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../../components/ProtectedRoute'
import Layout from '../../../../components/Layout'
import Breadcrumb from '@/components/ui/Breadcrumb'

export default function OfferingDetailPage() {
  return (
    <ProtectedRoute>
      <Layout title="Offering">
        <OfferingDetailContent />
      </Layout>
    </ProtectedRoute>
  )
}

function OfferingDetailContent() {
  const router = useRouter()
  const courseId = typeof router.query.courseId === 'string' ? router.query.courseId : ''
  const offeringId = typeof router.query.offeringId === 'string' ? router.query.offeringId : ''

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <Breadcrumb
        items={[
          { label: 'My Courses', href: '/courses' },
          { label: 'Course', href: `/courses/${courseId}` },
          { label: 'Offerings', href: `/courses/${courseId}/offerings` },
          { label: 'Offering detail' },
        ]}
      />
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Offering detail</h1>
      <p className="mt-1 text-sm text-slate-600">Offering ID: {offeringId || '—'}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={`/courses/${courseId}/offerings/${offeringId}/slides`} className="text-sm font-medium text-orange-700">
          Slides
        </Link>
        <Link href={`/courses/${courseId}/offerings/${offeringId}/midsem`} className="text-sm font-medium text-orange-700">
          Midsem
        </Link>
        <Link href={`/courses/${courseId}/offerings/${offeringId}/exams`} className="text-sm font-medium text-orange-700">
          Exams
        </Link>
      </div>
    </section>
  )
}
