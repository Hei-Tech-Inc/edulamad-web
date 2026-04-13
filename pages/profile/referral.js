import ProtectedRoute from '../../components/ProtectedRoute'
import Layout from '../../components/Layout'
import { useStudentReferral } from '@/hooks/students/useStudentReferral'

export default function ProfileReferralPage() {
  return (
    <ProtectedRoute>
      <Layout title="Referral">
        <ReferralContent />
      </Layout>
    </ProtectedRoute>
  )
}

function ReferralContent() {
  const referralQ = useStudentReferral()

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Referral</h1>
      {referralQ.isLoading ? <p className="mt-3 text-sm text-slate-500">Loading referral info...</p> : null}
      {referralQ.isError ? <p className="mt-3 text-sm text-rose-700">Could not load referral info.</p> : null}
      {!referralQ.isLoading && !referralQ.isError ? (
        <pre className="mt-4 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
          {JSON.stringify(referralQ.data, null, 2)}
        </pre>
      ) : null}
    </section>
  )
}
