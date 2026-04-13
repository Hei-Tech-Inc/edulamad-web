import ProtectedRoute from '../../components/ProtectedRoute'
import Layout from '../../components/Layout'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { useState } from 'react'
import { usePromoRedeem } from '@/hooks/promo/usePromoRedeem'

export default function ProfileSubscriptionPage() {
  return (
    <ProtectedRoute>
      <Layout title="Subscription">
        <SubscriptionContent />
      </Layout>
    </ProtectedRoute>
  )
}

function SubscriptionContent() {
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)
  const redeemM = usePromoRedeem()
  const plansQ = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get(API.subscriptions.plans, { signal })
      return Array.isArray(data) ? data : []
    },
  })

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Plans & upgrade</h1>
      {plansQ.isLoading ? <p className="mt-3 text-sm text-slate-500">Loading plans...</p> : null}
      {plansQ.isError ? <p className="mt-3 text-sm text-rose-700">Could not load plans.</p> : null}
      {!plansQ.isLoading && !plansQ.isError ? (
        <>
          <ul className="mt-4 space-y-2">
            {plansQ.data.map((plan, idx) => (
              <li key={String(plan.id || idx)} className="rounded-lg border border-slate-100 px-3 py-2">
                <p className="text-sm font-semibold text-slate-900">{plan.name || 'Plan'}</p>
                <p className="text-xs text-slate-500">{plan.description || 'Subscription plan'}</p>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Have a promo code?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter promo code"
                className="h-10 min-w-[220px] rounded-md border border-slate-300 px-3 text-sm"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!code.trim()) return
                  setMsg('')
                  try {
                    const res = await redeemM.mutateAsync({ code: code.trim() })
                    setOk(true)
                    setMsg(
                      typeof res.questionCreditsGranted === 'number'
                        ? `Redeemed: +${res.questionCreditsGranted} question credits`
                        : 'Promo code redeemed.',
                    )
                    setCode('')
                  } catch (error) {
                    setOk(false)
                    setMsg(error instanceof Error ? error.message : 'Could not redeem code.')
                  }
                }}
                className="rounded-md bg-orange-600 px-4 text-sm font-semibold text-white"
              >
                Redeem
              </button>
            </div>
            {msg ? <p className={`mt-2 text-xs ${ok ? 'text-emerald-700' : 'text-rose-700'}`}>{msg}</p> : null}
          </div>
        </>
      ) : null}
    </section>
  )
}
