import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ErrorStateProps = {
  error: Error | string | null | undefined
  onRetry: () => void
  fullScreen?: boolean
  className?: string
}

function toMessage(error: ErrorStateProps['error']) {
  const msg = typeof error === 'string' ? error : error?.message || ''
  const lower = msg.toLowerCase()
  if (!msg) return 'Something went wrong - try again'
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Check your connection and try again'
  }
  if (lower.includes('404')) return 'This content is no longer available'
  if (lower.includes('429')) return 'Too many requests - wait a moment and try again'
  if (lower.includes('500') || lower.includes('502') || lower.includes('503')) {
    return 'Something went wrong on our end - try again'
  }
  return 'Something went wrong - try again'
}

export default function ErrorState({ error, onRetry, fullScreen = false, className = '' }: ErrorStateProps) {
  return (
    <div
      className={`${fullScreen ? 'flex min-h-[40vh] items-center justify-center' : ''} ${className}`.trim()}
    >
      <div className="w-full rounded-2xl border border-rose-500/25 bg-rose-500/10 px-5 py-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-200">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-medium text-rose-100">{toMessage(error)}</p>
        <div className="mt-4">
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
}
