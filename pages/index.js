// pages/index.js — marketing landing (always shown at `/`; sign-in uses other routes)
import Head from 'next/head'
import LandingPage from '../components/marketing/LandingPage'
import { getMarketingBrandName } from '@/lib/landing-brand'

const BRAND = getMarketingBrandName()

/** Avoid stale HTML for the marketing page (CDN/browser caches). */
export async function getServerSideProps({ res }) {
  res.setHeader(
    'Cache-Control',
    'private, no-store, no-cache, must-revalidate, max-age=0',
  )
  return { props: {} }
}

export default function Home() {
  return (
    <>
      <Head>
        <title>{`${BRAND} — Past questions & exam prep for Ghanaian universities`}</title>
        <meta name="application-name" content={BRAND} />
        <meta
          name="description"
          content="Centralized past papers, verified solutions when available, AI explanations when they are not, exam simulations, and analytics so students revise what actually costs marks."
        />
        <meta
          property="og:title"
          content={`${BRAND} — Past questions & exam prep for Ghanaian universities`}
        />
        <meta property="og:site_name" content={BRAND} />
        <meta
          property="og:description"
          content="Study from one question bank — papers, schemes, simulations, and weak-topic insights built for Ghanaian semester exams."
        />
      </Head>
      <LandingPage />
    </>
  )
}
