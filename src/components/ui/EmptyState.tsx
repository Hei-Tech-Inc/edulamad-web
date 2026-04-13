import type { ComponentType } from 'react'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon?: ComponentType<{ className?: string }>
  title: string
  subtitle: string
  actionLabel?: string
  onAction?: () => void
  className?: string
  /** `light` = readable on white / gray panels (default). `dark` = glass on navy sidebars. */
  variant?: 'light' | 'dark'
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  subtitle,
  actionLabel,
  onAction,
  className = '',
  variant = 'light',
}: EmptyStateProps) {
  const isDark = variant === 'dark'
  return (
    <div
      className={cn(
        'rounded-2xl px-5 py-8 text-center',
        isDark
          ? 'border border-white/10 bg-white/[0.03]'
          : 'border border-slate-200 bg-white shadow-sm',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto flex h-10 w-10 items-center justify-center rounded-full border',
          isDark
            ? 'border-white/10 bg-white/[0.05] text-slate-300'
            : 'border-slate-200 bg-slate-50 text-slate-500',
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3
        className={cn(
          'mt-3 text-base font-semibold tracking-tight',
          isDark ? 'text-slate-100' : 'text-slate-900',
        )}
      >
        {title}
      </h3>
      <p className={cn('mt-2 text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>
        {subtitle}
      </p>
      {actionLabel && onAction ? (
        <div className="mt-4">
          <Button variant={isDark ? 'outline' : 'default'} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
