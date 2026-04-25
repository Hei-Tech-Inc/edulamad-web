import Link from 'next/link'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../components/ProtectedRoute'
import Layout from '../../components/Layout'
import { useQuestionDetail } from '@/hooks/questions/useQuestionDetail'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { isApiError } from '@/lib/api-error'
import QuestionLimitGate from '@/components/organisms/QuestionLimitGate'
import QuestionDetailTabs from '../../components/questions/QuestionDetailTabs'
import { QuestionTags } from '@/components/questions/QuestionTags'

export default function QuestionDetailPage() {
  return (
    <ProtectedRoute>
      <Layout title="Question">
        <QuestionDetailContent />
      </Layout>
    </ProtectedRoute>
  )
}

function QuestionDetailContent() {
  const router = useRouter()
  const questionId = typeof router.query.id === 'string' ? router.query.id : ''
  const questionQ = useQuestionDetail(questionId || undefined, Boolean(questionId))

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <Breadcrumb
        items={[
          { label: 'My Courses', href: '/courses' },
          { label: 'Question detail' },
        ]}
      />
      {questionQ.isLoading ? <p className="mt-3 text-sm text-slate-500">Loading question...</p> : null}
      {questionQ.isError && isApiError(questionQ.error) && questionQ.error.status === 403 ? (
        <div className="mt-3">
          <QuestionLimitGate title="You've used your 3 free questions" />
        </div>
      ) : null}
      {questionQ.isError &&
      !(isApiError(questionQ.error) && questionQ.error.status === 403) ? (
        <p className="mt-3 text-sm text-rose-700">Could not load question.</p>
      ) : null}
      {questionQ.data ? (
        <>
          <p className="mt-3 text-sm font-semibold text-slate-500">Question</p>
          <p className="mt-1 text-base text-slate-900">
            {questionQ.data.questionText || questionQ.data.text || 'Question'}
          </p>
          <QuestionTags questionId={questionId} editable />
        </>
      ) : null}
      {questionQ.data ? (
        <QuestionDetailTabs questionId={questionId} question={questionQ.data} />
      ) : null}
      <div className="mt-4">
        <Link href="/quiz/new" className="text-sm font-medium text-orange-700 hover:text-orange-800">
          Practice related questions
        </Link>
      </div>
    </section>
  )
}
