import type { ComponentType } from 'react'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

type EmptyStateProps = {
  icon?: ComponentType<{ className?: string }>
  title: string
  subtitle: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  subtitle,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-8 text-center ${className}`.trim()}
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-slate-300">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      {actionLabel && onAction ? (
        <div className="mt-4">
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
