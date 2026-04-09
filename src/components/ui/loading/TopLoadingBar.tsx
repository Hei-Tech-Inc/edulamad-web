import { useEffect, useRef } from 'react'
import { useLoadingBarStore } from '@/stores/loading-bar.store'

/**
 * Global YouTube/GitHub-style top loading bar.
 * Visual only: does not block interactions.
 */
export default function TopLoadingBar() {
  const { isVisible, status, reset } = useLoadingBarStore((s) => ({
    isVisible: s.isVisible,
    status: s.status,
    reset: s.reset,
  }))
  const progress = useLoadingBarStore((s) => s.progress)
  const setProgress = (next: number) =>
    useLoadingBarStore.setState((s) => ({ ...s, progress: Math.max(0, Math.min(100, next)) }))

  const holdTimer = useRef<number | null>(null)
  const finishTimer = useRef<number | null>(null)
  const fadeTimer = useRef<number | null>(null)

  useEffect(() => {
    const clearAll = () => {
      if (holdTimer.current) window.clearTimeout(holdTimer.current)
      if (finishTimer.current) window.clearTimeout(finishTimer.current)
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current)
      holdTimer.current = null
      finishTimer.current = null
      fadeTimer.current = null
    }

    clearAll()

    if (status === 'loading') {
      setProgress(8)
      holdTimer.current = window.setTimeout(() => setProgress(72), 30)
      return clearAll
    }

    if (status === 'success') {
      setProgress(100)
      finishTimer.current = window.setTimeout(() => {
        reset()
      }, 360)
      return clearAll
    }

    if (status === 'error') {
      setProgress(100)
      fadeTimer.current = window.setTimeout(() => {
        reset()
      }, 520)
      return clearAll
    }

    return clearAll
  }, [status, reset])

  const barColor =
    status === 'error'
      ? 'bg-rose-500'
      : 'bg-[linear-gradient(90deg,#ff5c00_0%,#ff8a33_100%)]'
  const hidden = !isVisible || status === 'idle'

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed left-0 top-0 z-[100] h-[3px] w-full transition-opacity duration-150 ${
        hidden ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`h-full ${barColor} transition-[width] duration-[200ms] ease-out`}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
