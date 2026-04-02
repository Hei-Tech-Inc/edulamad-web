// components/PendingApprovalPage.js — email verification guidance (Nsuo)
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import MarketingShell from './marketing/MarketingShell'

const PendingApprovalPage = () => {
  const [refId, setRefId] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = new URLSearchParams(window.location.search).get('id')
    setRefId(id)
  }, [])

  return (
    <MarketingShell maxWidthClass="max-w-lg">
      <Link
        href="/"
        className="mb-8 inline-flex items-center text-sm font-medium text-teal-300/90 transition hover:text-teal-200"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to overview
      </Link>

      <div className="rounded-2xl border border-white/10 bg-slate-900/35 p-8 text-center shadow-2xl backdrop-blur-md sm:p-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-400/10 text-teal-300 ring-1 ring-teal-400/20">
          <Mail className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <h1 className="font-['Fraunces',serif] text-2xl font-semibold text-white">
          Check your email
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Nsuo confirms new organisations when you complete signup and verify
          your email. Open the verification link we sent you, then sign in.
        </p>
        {refId && (
          <p className="mt-4 font-mono text-xs text-slate-500">
            Reference: {refId}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex justify-center rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:brightness-105"
          >
            Sign in
          </Link>
          <Link
            href="/register-company"
            className="inline-flex justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Register organisation
          </Link>
        </div>
      </div>
    </MarketingShell>
  )
}

export default PendingApprovalPage
