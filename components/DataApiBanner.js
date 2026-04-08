import React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'

/** `embedded`: sits under app header (not viewport-sticky). Default is global strip above page chrome. */
export function DataApiBanner({
  error,
  loading,
  onRetry,
  embedded = false,
}) {
  const reduceMotion = useReducedMotion()

  const outerClass = embedded
    ? 'relative z-20 border-b border-slate-200/90 bg-[#F8FAFC] dark:border-slate-700/80 dark:bg-[#0F172A]'
    : 'pointer-events-auto sticky top-0 z-[100] border-b border-slate-200/90 bg-[#F8FAFC]/95 backdrop-blur-sm dark:border-slate-700/80 dark:bg-[#0F172A]/95'

  return (
    <AnimatePresence mode="sync">
      {error ? (
        <motion.div
          key="data-api-banner"
          role="alert"
          aria-live="polite"
          initial={reduceMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? {} : { opacity: 0, y: -4 }}
          transition={{
            duration: reduceMotion ? 0 : 0.2,
            ease: [0.4, 0, 0.2, 1],
          }}
          className={outerClass}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-3">
            <div className="flex min-w-0 flex-1 gap-3 sm:gap-3.5">
              <div
                className="
                  mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white
                  text-amber-600 dark:border-slate-600 dark:bg-slate-800 dark:text-amber-400
                "
              >
                <AlertTriangle className="h-4 w-4" strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0 border-l-2 border-orange-600/80 pl-3 dark:border-orange-500/70">
                <p className="text-sm font-semibold tracking-tight text-[#020617] dark:text-slate-50">
                  Unable to synchronize workspace data
                </p>
                <p
                  className="mt-1 text-sm leading-snug text-[#334155] dark:text-slate-300"
                  title={error}
                >
                  {error}
                </p>
                <p className="mt-1 text-xs leading-normal text-slate-500 dark:text-slate-400">
                  Verify the API is available and your network is stable. Your session will
                  remain active.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 sm:items-center">
              <button
                type="button"
                disabled={loading}
                onClick={onRetry}
                className="
                  inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white
                  transition-colors duration-200 ease-out
                  hover:bg-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600
                  disabled:pointer-events-none disabled:opacity-50
                  dark:bg-primary-600 dark:hover:bg-primary-700
                  sm:w-auto
                "
              >
                <RefreshCw
                  className={`h-4 w-4 shrink-0 ${loading ? 'animate-spin' : ''}`}
                  aria-hidden
                />
                {loading ? 'Retrying…' : 'Retry connection'}
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
