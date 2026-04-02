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
      <div className="flex min-h-screen items-center justify-center bg-[#070b14]">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-teal-400/25 border-t-teal-400"
          aria-hidden
        />
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b14]">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-teal-400/25 border-t-teal-400"
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
          content="Multi-tenant operations software for aquaculture: organisations, farms, units, daily records, harvests, and audit-ready reporting."
        />
        <meta property="og:title" content="Nsuo — Aquaculture operations platform" />
        <meta
          property="og:description"
          content="Run every farm with one system — from stocking to harvest."
        />
      </Head>
      <LandingPage />
    </>
  )
}
