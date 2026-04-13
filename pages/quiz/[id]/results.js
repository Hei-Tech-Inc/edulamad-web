import Link from 'next/link'
import { useMemo } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../components/ProtectedRoute'
import Layout from '../../../components/Layout'

export default function QuizResultsPage() {
  return (
    <ProtectedRoute>
      <Layout title="Quiz Results">
        <QuizResultsContent />
      </Layout>
    </ProtectedRoute>
  )
}

function QuizResultsContent() {
  const router = useRouter()
  const quizId = typeof router.query.id === 'string' ? router.query.id : ''

  const decoded = useMemo(() => {
    try {
      return quizId ? JSON.parse(decodeURIComponent(quizId)) : null
    } catch {
      return null
    }
  }, [quizId])

  const total = Number(decoded?.total || 0)
  const correct = Number(decoded?.correct || 0)
  const incorrect = Number(decoded?.incorrect || Math.max(0, total - correct))
  const flagged = Number(decoded?.flagged || 0)
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const rows = Array.isArray(decoded?.questionBreakdown) ? decoded.questionBreakdown : []

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Results</h1>
      <p className="mt-1 text-sm text-slate-600">
        {decoded?.courseLabel || 'Course quiz'} · {decoded?.sessionLabel || 'Session'}
      </p>

      <div className="mt-6 rounded-xl border border-slate-100 p-4">
        <p className="text-3xl font-bold text-slate-900">{pct}%</p>
        <p className="mt-1 text-sm text-slate-600">
          {correct}/{total} correct
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Incorrect: {incorrect} · Flagged: {flagged}
        </p>
      </div>

      {rows.length ? (
        <div className="mt-5 rounded-xl border border-slate-100">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
            Question by question
          </div>
          <ul className="divide-y divide-slate-100">
            {rows.map((row) => {
              const isCorrect =
                typeof row.correctIndex === 'number' &&
                typeof row.selectedIndex === 'number' &&
                row.correctIndex === row.selectedIndex
              return (
                <li key={String(row.id)} className="px-4 py-3">
                  <p className="text-sm text-slate-900">
                    {row.index}. {isCorrect ? '✓' : '✗'} {row.text}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    your: {row.selectedText || '—'} · correct: {row.correctText || '—'}
                    {row.flagged ? ' · ⚑ flagged' : ''}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/quiz/new" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white">
          New quiz
        </Link>
        <Link href="/quiz/history" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
          Quiz history
        </Link>
        <button
          type="button"
          onClick={async () => {
            const shareText = `${decoded?.courseLabel || 'Quiz'}: ${correct}/${total} (${pct}%)`
            if (navigator.share) {
              try {
                await navigator.share({ title: 'Quiz Result', text: shareText })
                return
              } catch {
                /* fallback */
              }
            }
            await navigator.clipboard.writeText(shareText)
          }}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Share result
        </button>
      </div>
    </section>
  )
}
