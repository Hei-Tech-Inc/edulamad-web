import { useRouter } from 'next/router'
import ProtectedRoute from '../../../../../components/ProtectedRoute'
import Layout from '../../../../../components/Layout'
import Breadcrumb from '@/components/ui/Breadcrumb'

export default function OfferingSlidesPage() {
  return (
    <ProtectedRoute>
      <Layout title="Slides">
        <SlidesContent />
      </Layout>
    </ProtectedRoute>
  )
}

function SlidesContent() {
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
          { label: 'Offering detail', href: `/courses/${courseId}/offerings/${offeringId}` },
          { label: 'Slides' },
        ]}
      />
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Slides</h1>
      <p className="mt-1 text-sm text-slate-600">Slides viewer route scaffold is ready.</p>
    </section>
  )
}
