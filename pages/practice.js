import { useEffect } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'

function pickQuery(q, key) {
  const v = q[key]
  if (typeof v === 'string') return v
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0]
  return ''
}

function buildPayloadFromQuery(q) {
  const courseId = pickQuery(q, 'courseId').trim()
  const year = pickQuery(q, 'year').trim()
  const level = pickQuery(q, 'level').trim()
  if (!courseId || !year || !level) return null
  const type = pickQuery(q, 'type') || 'all'
  const courseName = pickQuery(q, 'courseName')
  const mode = pickQuery(q, 'mode') === 'quiz' ? 'quiz' : 'review'
  const countRaw = parseInt(pickQuery(q, 'count'), 10)
  const seedRaw = parseInt(pickQuery(q, 'seed'), 10)
  const minsRaw = parseInt(pickQuery(q, 'mins'), 10)
  const payload = {
    courseId,
    year,
    level,
    type: type || 'all',
    mode,
  }
  if (courseName) payload.courseName = courseName
  if (Number.isFinite(countRaw)) payload.count = countRaw
  if (Number.isFinite(seedRaw)) payload.seed = seedRaw
  if (Number.isFinite(minsRaw)) payload.mins = minsRaw
  return payload
}

function PracticeRedirectInner() {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    const payload = buildPayloadFromQuery(router.query)
    if (payload) {
      const id = encodeURIComponent(JSON.stringify(payload))
      void router.replace(`/quiz/${id}`)
    } else {
      void router.replace('/quiz/new')
    }
  }, [router.isReady, router.query, router])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
      Redirecting to quiz…
    </div>
  )
}

export default function PracticePage() {
  return (
    <ProtectedRoute>
      <Layout title="Quiz mode">
        <PracticeRedirectInner />
      </Layout>
    </ProtectedRoute>
  )
}
