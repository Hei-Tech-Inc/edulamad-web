'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import { SiGithub } from 'react-icons/si'
import { getSafeInternalPath } from '@/lib/safe-next-path'

/** Official multicolor “G” (brand colors: blue, green, yellow, red). */
function GoogleLogo({ className = 'h-5 w-5 shrink-0' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

const BTN_BASE =
  'flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--border-default)] bg-bg-surface px-4 py-3 text-sm font-semibold text-text-primary shadow-sm transition hover:border-orange-500/35 hover:bg-bg-raised/80 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:border-orange-400/30'

/**
 * OAuth buttons — providers come from GET /api/auth/providers (NextAuth).
 */
export function SocialAuthButtons({ className = '' }) {
  const router = useRouter()
  const [providers, setProviders] = useState(null)
  const [busy, setBusy] = useState(null)

  useEffect(() => {
    let cancelled = false
    void fetch('/api/auth/providers')
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setProviders(json && typeof json === 'object' ? json : {})
      })
      .catch(() => {
        if (!cancelled) setProviders({})
      })
    return () => {
      cancelled = true
    }
  }, [])

  const callbackUrl =
    (router.isReady && getSafeInternalPath(router.query.next)) || '/dashboard'

  const runSignIn = (providerId) => {
    setBusy(providerId)
    void signIn(providerId, { callbackUrl }).finally(() => setBusy(null))
  }

  if (providers === null) {
    return (
      <div className={`flex flex-col gap-2.5 ${className}`} aria-hidden>
        <div className="h-11 animate-pulse rounded-xl bg-bg-raised/70 dark:bg-bg-surface/40" />
        <div className="h-11 animate-pulse rounded-xl bg-bg-raised/70 dark:bg-bg-surface/40" />
      </div>
    )
  }

  if (Object.keys(providers).length === 0) {
    return null
  }

  const showGoogle = Boolean(providers.google)
  const showGithub = Boolean(providers.github)

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {showGoogle ? (
        <button
          type="button"
          className={BTN_BASE}
          disabled={busy !== null}
          onClick={() => runSignIn('google')}
          aria-busy={busy === 'google'}
        >
          <GoogleLogo />
          {busy === 'google' ? 'Continuing…' : 'Continue with Google'}
        </button>
      ) : null}
      {showGithub ? (
        <button
          type="button"
          className={BTN_BASE}
          disabled={busy !== null}
          onClick={() => runSignIn('github')}
          aria-busy={busy === 'github'}
        >
          <SiGithub className="h-4 w-4 shrink-0" aria-hidden />
          {busy === 'github' ? 'Continuing…' : 'Continue with GitHub'}
        </button>
      ) : null}
    </div>
  )
}
