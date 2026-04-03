// pages/index.js — marketing landing (authenticated users redirect via _app)
import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import LandingPage from '../components/marketing/LandingPage'

export default function Home() {
  const { user, loading, initialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (initialized && !loading && user) {
      router.replace('/dashboard')
    }
  }, [initialized, loading, user, router])

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-sky-500"
          aria-hidden
        />
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-sky-500"
          aria-hidden
        />
        <span className="sr-only">Redirecting</span>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Nsuo — Aquaculture operations platform</title>
        <meta
          name="description"
          content="The operations layer for aquaculture: organisations, farms, units, daily records, harvests, and audit-ready reporting — one disciplined system."
        />
        <meta property="og:title" content="Nsuo — Aquaculture operations platform" />
        <meta
          property="og:description"
          content="Unify every farm you run — stocking through harvest, with a command centre your team actually uses."
        />
      </Head>
      <LandingPage />
    </>
  )
}
