import Link from 'next/link'
import { Button } from '../ui/button'

const primaryLinkClass =
  'inline-flex h-9 items-center justify-center rounded-lg bg-orange-600 px-3 text-sm font-medium text-white transition hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2'

export default function OnboardingNotice({ notice, onDismiss }) {
  return (
    <section className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 shadow-[0_12px_30px_rgba(251,146,60,0.14)] dark:border-orange-900/70 dark:bg-orange-950/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-orange-900 dark:text-orange-200">
            {notice || 'Complete your profile to unlock all features.'}
          </p>
          <p className="mt-1 text-xs text-orange-700 dark:text-orange-300">
            Add institution and program details once; we&apos;ll reuse them across the app.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/onboarding" className={primaryLinkClass}>
            Complete profile
          </Link>
          {notice ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-lg border-orange-400 px-3 text-sm text-orange-800 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-200 dark:hover:bg-orange-900/30"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
