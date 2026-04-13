import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import ProtectedRoute from '../../../../components/ProtectedRoute'
import {
  useCompleteFlashcardSession,
  useReviewFlashcardCard,
} from '@/hooks/flashcards/useFlashcards'
import {
  clearFlashcardSessionPayload,
  loadFlashcardSessionPayload,
} from '@/lib/flashcard-session-storage'

const RATING_OPTIONS = [
  { label: 'Forgot', rating: 1 },
  { label: 'Hard', rating: 3 },
  { label: 'Good', rating: 4 },
  { label: 'Easy', rating: 5 },
]

export default function FlashcardStudyPage() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Study session</title>
      </Head>
      <StudyInner />
    </ProtectedRoute>
  )
}

function StudyInner() {
  const router = useRouter()
  const deckId = typeof router.query.deckId === 'string' ? router.query.deckId : ''
  const sessionId =
    typeof router.query.sessionId === 'string' ? router.query.sessionId : ''
  const mode = typeof router.query.mode === 'string' ? router.query.mode : ''

  const [payload, setPayload] = useState(null)
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [complete, setComplete] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(10)
  const timerRef = useRef(null)
  const startedAt = useRef(Date.now())

  const reviewM = useReviewFlashcardCard()
  const completeM = useCompleteFlashcardSession()

  useEffect(() => {
    if (!router.isReady || !sessionId) return
    const p = loadFlashcardSessionPayload(sessionId)
    setPayload(p)
  }, [router.isReady, sessionId])

  const cards = payload?.cards ?? []
  const current = cards[idx]?.card
  const total = cards.length

  const correctCountRef = useRef(0)
  const skippedRef = useRef(0)

  useEffect(() => {
    if (mode !== 'quick_fire' || !flipped || complete) return undefined
    setSecondsLeft(10)
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current)
          void submitRating(1, true)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- advance card via submitRating
  }, [mode, flipped, idx, complete])

  const submitRating = async (rating, fromTimer = false) => {
    if (!current || !sessionId || !deckId) return
    if (fromTimer) skippedRef.current += 1
    else if (rating >= 3) correctCountRef.current += 1
    try {
      await reviewM.mutateAsync({
        cardId: current._id,
        deckId,
        rating,
        sessionId,
      })
    } catch {
      /* continue session */
    }
    if (idx + 1 >= total) {
      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - startedAt.current) / 1000),
      )
      try {
        const res = await completeM.mutateAsync({
          sessionId,
          cardsStudied: total,
          cardsCorrect: correctCountRef.current,
          cardsSkipped: skippedRef.current,
          durationSeconds,
        })
        setComplete(res)
        clearFlashcardSessionPayload(sessionId)
      } catch {
        setComplete({ xpEarned: 0, completedAt: Date.now() })
      }
      return
    }
    setIdx((i) => i + 1)
    setFlipped(false)
    setSecondsLeft(10)
  }

  const summary = useMemo(() => {
    if (!complete) return null
    return complete
  }, [complete])

  if (!router.isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05070d] text-slate-200">
        Loading…
      </div>
    )
  }

  if (!payload || !sessionId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#05070d] px-4 text-center text-slate-200">
        <p className="text-sm">Session expired or missing. Start again from the deck page.</p>
        <Link
          href={deckId ? `/flashcards/decks/${deckId}` : '/flashcards'}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Back
        </Link>
      </div>
    )
  }

  if (summary) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#05070d] px-4 text-center text-slate-100">
        <p className="text-2xl font-bold">Session complete</p>
        <p className="text-slate-300">You earned {summary.xpEarned ?? 0} XP</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => void router.replace(`/flashcards/decks/${deckId}`)}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to deck
          </button>
          <Link
            href="/flashcards"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Flashcards hub
          </Link>
        </div>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05070d] text-slate-200">
        No cards in this session.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05070d] px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-xl">
        <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
          <span>
            Card {idx + 1} of {total}
          </span>
          {mode === 'quick_fire' && flipped ? (
            <span className="font-mono text-orange-300">{secondsLeft}s</span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="w-full rounded-2xl border border-white/10 bg-[#0b1222] p-6 text-left shadow-xl"
        >
          {!flipped ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-300">
                {current.topic || 'Topic'}
              </p>
              <p className="mt-3 text-lg font-medium leading-relaxed">{current.front}</p>
              <p className="mt-6 text-sm text-slate-500">Tap to flip</p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Answer</p>
              <p className="mt-3 text-lg font-medium leading-relaxed">{current.back}</p>
              {cards[idx]?.card?.explanation ? (
                <p className="mt-4 text-sm text-slate-300">{cards[idx].card.explanation}</p>
              ) : null}
              {cards[idx]?.card?.mnemonic ? (
                <p className="mt-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-amber-200">
                  {cards[idx].card.mnemonic}
                </p>
              ) : null}
            </>
          )}
        </button>

        {flipped ? (
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {RATING_OPTIONS.map((r) => (
              <button
                key={r.rating}
                type="button"
                onClick={() => void submitRating(r.rating)}
                disabled={reviewM.isPending}
                className="rounded-xl bg-white/10 px-2 py-3 text-xs font-semibold text-white hover:bg-white/20 disabled:opacity-50"
              >
                {r.label}
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="mt-6 w-full rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Flip card
          </button>
        )}
      </div>
    </div>
  )
}
