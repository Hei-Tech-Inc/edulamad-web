import { useState } from 'react'
import Link from 'next/link'
import { usePromoRedeem } from '@/hooks/promo/usePromoRedeem'
import { useAuthStore } from '@/stores/auth.store'
import { sessionHasAdminTools } from '@/lib/session-admin-access'

export default function QuestionLimitGate({ title = "You've used your free questions" }) {
  const redeemM = usePromoRedeem()
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [ok, setOk] = useState(false)
  const sessionUser = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const showUpload = sessionHasAdminTools(sessionUser, accessToken)

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">Earn more questions or upgrade to continue practicing.</p>

      <div
        className={`mt-5 grid gap-3 ${showUpload ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}
      >
        <div className="rounded-xl border border-slate-100 p-4">
          <p className="text-sm font-semibold text-slate-900">Invite a friend</p>
          <p className="mt-1 text-xs text-slate-500">Get more free questions when they join.</p>
          <Link href="/profile/referral" className="mt-2 inline-block text-sm font-medium text-orange-700">
            Copy invite link
          </Link>
        </div>
        {showUpload ? (
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-900">Upload content</p>
            <p className="mt-1 text-xs text-slate-500">Contribute questions or solutions for bonus credits.</p>
            <Link href="/upload" className="mt-2 inline-block text-sm font-medium text-orange-700">
              Upload content
            </Link>
          </div>
        ) : null}
        <div className="rounded-xl border border-slate-100 p-4">
          <p className="text-sm font-semibold text-slate-900">Use promo code</p>
          <div className="mt-2 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter promo code"
              className="h-9 flex-1 rounded-md border border-slate-300 px-2 text-sm"
            />
            <button
              type="button"
              onClick={async () => {
                if (!code.trim()) return
                setMessage('')
                try {
                  const res = await redeemM.mutateAsync({ code: code.trim() })
                  if (!res.ok) {
                    setOk(false)
                    setMessage(res.message || 'Could not redeem code.')
                    return
                  }
                  setOk(true)
                  setMessage(
                    typeof res.questionCreditsGranted === 'number'
                      ? `Redeemed: +${res.questionCreditsGranted} question credits`
                      : 'Promo code redeemed.',
                  )
                  setCode('')
                } catch (error) {
                  setOk(false)
                  setMessage(error instanceof Error ? error.message : 'Could not redeem code.')
                }
              }}
              className="rounded-md bg-orange-600 px-3 text-sm font-semibold text-white"
            >
              Redeem
            </button>
          </div>
          {message ? (
            <p className={`mt-2 text-xs ${ok ? 'text-emerald-700' : 'text-rose-700'}`}>{message}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Upgrade to Pro — unlimited questions</p>
        <p className="mt-1 text-xs text-slate-600">Includes AI solutions and exam simulation tools.</p>
        <Link href="/profile/subscription" className="mt-2 inline-block text-sm font-medium text-orange-700">
          See plans
        </Link>
      </div>
    </section>
  )
}
