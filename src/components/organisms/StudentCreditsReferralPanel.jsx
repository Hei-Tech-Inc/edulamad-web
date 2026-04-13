import { useCallback, useState } from 'react'
import { Copy, Gift, Link2, Loader2, Ticket } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import LoadingButton from '@/components/ui/LoadingButton'
import ErrorState from '@/components/ui/ErrorState'
import { useStudentReferral } from '@/hooks/students/useStudentReferral'
import { useQuestionCredits } from '@/hooks/students/useQuestionCredits'
import { usePromoRedeem } from '@/hooks/promo/usePromoRedeem'
import { AppApiError } from '@/lib/api-error'

function errMsg(err, fallback) {
  if (err instanceof AppApiError) return err.message
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export default function StudentCreditsReferralPanel() {
  const referralQ = useStudentReferral()
  const creditsQ = useQuestionCredits()
  const redeemM = usePromoRedeem()
  const [promoCode, setPromoCode] = useState('')
  const [redeemMsg, setRedeemMsg] = useState('')
  const [redeemOk, setRedeemOk] = useState(false)
  const [copyDone, setCopyDone] = useState(false)

  const copyLink = useCallback(async () => {
    const link = referralQ.data?.referralLink
    if (!link || typeof navigator === 'undefined' || !navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(link)
      setCopyDone(true)
      window.setTimeout(() => setCopyDone(false), 2000)
    } catch {
      /* ignore */
    }
  }, [referralQ.data?.referralLink])

  const refErr = referralQ.isError ? errMsg(referralQ.error, 'Could not load referral info.') : null
  const credErr = creditsQ.isError ? errMsg(creditsQ.error, 'Could not load question credits.') : null

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Gift className="h-5 w-5 text-orange-600" aria-hidden />
          Credits & referrals
        </CardTitle>
        <p className="text-xs text-slate-500">
          Question credits (free views + ledger), your referral link, and promo codes from{' '}
          <span className="font-mono">POST /promo/redeem</span>.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Question credits
          </h3>
          {credErr ? (
            <ErrorState error={credErr} onRetry={() => void creditsQ.refetch()} className="mt-2" />
          ) : creditsQ.isLoading ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading…
            </p>
          ) : (
            <dl className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2">
                <dt className="text-[11px] font-medium uppercase text-slate-500">Balance</dt>
                <dd className="text-lg font-semibold text-slate-900">{creditsQ.data?.balance ?? 0}</dd>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2">
                <dt className="text-[11px] font-medium uppercase text-slate-500">Lifetime earned</dt>
                <dd className="text-lg font-semibold text-slate-900">
                  {creditsQ.data?.lifetimeEarned ?? 0}
                </dd>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2">
                <dt className="text-[11px] font-medium uppercase text-slate-500">Lifetime used</dt>
                <dd className="text-lg font-semibold text-slate-900">
                  {creditsQ.data?.lifetimeUsed ?? 0}
                </dd>
              </div>
            </dl>
          )}
          {!credErr && creditsQ.data?.viewedQuestionIds?.length ? (
            <p className="mt-2 text-xs text-slate-500">
              Unique questions viewed (tracked): {creditsQ.data.viewedQuestionIds.length}
            </p>
          ) : null}
          {!credErr && creditsQ.data?.ledger?.length ? (
            <details className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              <summary className="cursor-pointer font-medium text-slate-700">Recent ledger</summary>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto font-mono text-[11px] leading-relaxed">
                {creditsQ.data.ledger.slice(-15).map((row, i) => (
                  <li key={i}>{JSON.stringify(row)}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Link2 className="h-3.5 w-3.5" aria-hidden />
            Referral
          </h3>
          {refErr ? (
            <ErrorState error={refErr} onRetry={() => void referralQ.refetch()} className="mt-2" />
          ) : referralQ.isLoading ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading…
            </p>
          ) : (
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                <span className="text-slate-500">Your code: </span>
                <span className="font-mono font-semibold text-slate-900">
                  {referralQ.data?.referralCode ?? '—'}
                </span>
              </p>
              <p>
                <span className="text-slate-500">Referrals: </span>
                {referralQ.data?.totalReferrals ?? 0}
                <span className="mx-2 text-slate-300">·</span>
                <span className="text-slate-500">Credits from referrals: </span>
                {referralQ.data?.creditsEarnedFromReferrals ?? 0}
              </p>
              {referralQ.data?.referralLink ? (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="max-w-full truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-800">
                    {referralQ.data.referralLink}
                  </span>
                  <Button type="button" variant="outline" size="sm" className="gap-1" onClick={copyLink}>
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                    {copyDone ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No referral link yet (API may assign a code first).</p>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Ticket className="h-3.5 w-3.5" aria-hidden />
            Redeem promo code
          </h3>
          <form onSubmit={(e) => e.preventDefault()} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter code"
              className="sm:max-w-xs"
              autoComplete="off"
            />
            <LoadingButton
              label="Redeem"
              loadingLabel="Redeeming…"
              className="w-full sm:w-auto"
              onPress={async () => {
                const code = promoCode.trim()
                if (!code) {
                  setRedeemMsg('Enter a promo code.')
                  setRedeemOk(false)
                  return
                }
                setRedeemMsg('')
                setRedeemOk(false)
                try {
                  const res = await redeemM.mutateAsync({ code })
                  const parts = []
                  if (res.unlocksPlan) parts.push(`Plan unlocked: ${res.unlocksPlan}`)
                  if (typeof res.questionCreditsGranted === 'number')
                    parts.push(`+${res.questionCreditsGranted} question credits`)
                  setRedeemMsg(parts.length ? parts.join(' · ') : 'Code redeemed.')
                  setRedeemOk(true)
                  setPromoCode('')
                } catch (err) {
                  setRedeemMsg(errMsg(err, 'Could not redeem code.'))
                  setRedeemOk(false)
                }
              }}
            />
          </form>
          {redeemMsg ? (
            <p className={`mt-2 text-sm ${redeemOk ? 'text-emerald-700' : 'text-rose-600'}`}>
              {redeemMsg}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
