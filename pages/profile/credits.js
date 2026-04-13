import ProtectedRoute from '../../components/ProtectedRoute'
import Layout from '../../components/Layout'
import { useQuestionCredits } from '@/hooks/students/useQuestionCredits'

export default function ProfileCreditsPage() {
  return (
    <ProtectedRoute>
      <Layout title="Credits">
        <CreditsContent />
      </Layout>
    </ProtectedRoute>
  )
}

function CreditsContent() {
  const creditsQ = useQuestionCredits()

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Question credit history</h1>
      {creditsQ.isLoading ? <p className="mt-3 text-sm text-slate-500">Loading credits...</p> : null}
      {creditsQ.isError ? <p className="mt-3 text-sm text-rose-700">Could not load credits.</p> : null}
      {!creditsQ.isLoading && !creditsQ.isError ? (
        <pre className="mt-4 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
          {JSON.stringify(creditsQ.data, null, 2)}
        </pre>
      ) : null}
    </section>
  )
}
