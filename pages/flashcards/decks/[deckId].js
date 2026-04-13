import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../components/ProtectedRoute'
import Layout from '../../../components/Layout'
import {
  useFlashcardDeckDetail,
  useFlashcardDue,
  useFlashcardProgress,
  useFlashcardWeak,
  useStartFlashcardSession,
} from '@/hooks/flashcards/useFlashcards'
import { saveFlashcardSessionPayload } from '@/lib/flashcard-session-storage'
import { ArrowLeft } from 'lucide-react'

export default function FlashcardDeckPage() {
  return (
    <ProtectedRoute>
      <Layout title="Deck">
        <Head>
          <title>Flashcard deck</title>
        </Head>
        <DeckInner />
      </Layout>
    </ProtectedRoute>
  )
}

function DeckInner() {
  const router = useRouter()
  const deckId = typeof router.query.deckId === 'string' ? router.query.deckId : ''
  const courseId =
    typeof router.query.courseId === 'string' ? router.query.courseId : ''

  const deckQ = useFlashcardDeckDetail(deckId || undefined, Boolean(deckId))
  const progQ = useFlashcardProgress(deckId || undefined, Boolean(deckId))
  const dueQ = useFlashcardDue(deckId || undefined, 20, Boolean(deckId))
  const weakQ = useFlashcardWeak(deckId || undefined, Boolean(deckId))
  const startM = useStartFlashcardSession()

  const deck = deckQ.data?.deck
  const total = progQ.data?.totalCards ?? deck?.cardCount ?? 0
  const mastered = progQ.data?.masteredCards ?? 0
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0

  const start = async (mode) => {
    if (!deckId) return
    try {
      const res = await startM.mutateAsync({ deckId, mode })
      saveFlashcardSessionPayload(res.sessionId, {
        sessionId: res.sessionId,
        deckId,
        mode,
        cards: res.cards ?? [],
        startedAt: Date.now(),
      })
      void router.push(
        `/flashcards/decks/${deckId}/study?sessionId=${encodeURIComponent(
          res.sessionId,
        )}&mode=${encodeURIComponent(mode)}`,
      )
    } catch {
      /* surfaced via UI */
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/flashcards"
        className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All flashcards
      </Link>

      {deckQ.isLoading ? <p className="text-sm text-slate-500">Loading deck…</p> : null}
      {deckQ.isError ? (
        <p className="text-sm text-rose-700">Could not load this deck.</p>
      ) : null}

      {deck ? (
        <>
          <header>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {courseId ? (
                <Link href={`/courses/${courseId}`} className="text-orange-700 hover:underline">
                  Course
                </Link>
              ) : (
                'Deck'
              )}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{deck.title}</h1>
            <p className="mt-2 text-sm text-slate-600">
              {deck.cardCount} cards · Mastered {mastered} / {total || deck.cardCount}
            </p>
            <div className="mt-3 h-2 max-w-md overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-orange-500"
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </header>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={startM.isPending || (dueQ.data?.length ?? 0) === 0}
              onClick={() => void start('spaced_repetition')}
              className="rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Spaced repetition
              {dueQ.data?.length ? ` (${dueQ.data.length} due)` : ''}
            </button>
            <button
              type="button"
              disabled={startM.isPending}
              onClick={() => void start('quick_fire')}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:border-orange-300"
            >
              Quick fire
            </button>
            <button
              type="button"
              disabled={startM.isPending}
              onClick={() => void start('full_review')}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:border-orange-300"
            >
              Full review
            </button>
            {(weakQ.data?.length ?? 0) > 0 ? (
              <button
                type="button"
                disabled={startM.isPending}
                onClick={() => void start('weak_cards')}
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 hover:bg-amber-100"
              >
                Weak cards ({weakQ.data?.length})
              </button>
            ) : null}
          </div>
          {startM.isError ? (
            <p className="text-sm text-rose-700">Could not start a session. Try again.</p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
