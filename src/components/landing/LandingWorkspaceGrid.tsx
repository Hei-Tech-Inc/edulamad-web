'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export type WorkspaceCardConfig = {
  label: string;
  icon: LucideIcon;
  description: string;
  size: 'hero' | 'side' | 'tile' | 'full';
  tag?: string;
};

function gridClass(size: WorkspaceCardConfig['size']) {
  switch (size) {
    case 'hero':
      return 'sm:col-span-2 lg:col-span-7 lg:min-h-[220px]';
    case 'side':
      return 'sm:col-span-2 lg:col-span-5 lg:min-h-[220px]';
    case 'tile':
      return 'lg:col-span-4';
    case 'full':
      return 'sm:col-span-2 lg:col-span-12';
    default:
      return '';
  }
}

type LandingWorkspaceGridProps = {
  cards: WorkspaceCardConfig[];
  /** When true, omit default top margin (e.g. inside an inset frame). */
  noOuterMargin?: boolean;
  /** Background mesh: `modules` = teal-only; `product` = teal + cool sky (no violet). */
  mesh?: 'default' | 'modules' | 'product';
};

const meshBackground: Record<NonNullable<LandingWorkspaceGridProps['mesh']>, string> = {
  default:
    'radial-gradient(ellipse 55% 45% at 20% 30%, rgba(45, 212, 191, 0.14), transparent 55%), radial-gradient(ellipse 40% 35% at 85% 70%, rgba(139, 92, 246, 0.1), transparent 50%)',
  modules:
    'radial-gradient(ellipse 55% 45% at 18% 28%, rgba(45, 212, 191, 0.16), transparent 56%), radial-gradient(ellipse 42% 38% at 88% 72%, rgba(20, 184, 166, 0.09), transparent 52%)',
  product:
    'radial-gradient(ellipse 50% 42% at 15% 35%, rgba(45, 212, 191, 0.12), transparent 55%), radial-gradient(ellipse 45% 40% at 90% 25%, rgba(14, 165, 233, 0.11), transparent 50%)',
};

export function LandingWorkspaceGrid({
  cards,
  noOuterMargin = false,
  mesh = 'default',
}: LandingWorkspaceGridProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`relative ${noOuterMargin ? '' : 'mt-10 lg:mt-14'}`}>
      {/* Soft mesh + grid hint */}
      <div
        className="pointer-events-none absolute -inset-x-12 -inset-y-8 rounded-[2.5rem] opacity-70 blur-3xl dark:opacity-50"
        style={{
          background: meshBackground[mesh],
        }}
        aria-hidden
      />

      <ul className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4">
        {cards.map(({ label, icon: Icon, description, size, tag }, i) => {
          const isHero = size === 'hero';
          const isFull = size === 'full';

          return (
            <motion.li
              key={label}
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.5,
                delay: reduceMotion ? 0 : 0.04 + i * 0.045,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`group ${gridClass(size)}`}
            >
              <div
                className={`relative flex h-full overflow-hidden rounded-2xl border border-[var(--border-default)] bg-bg-surface/90 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] backdrop-blur-md transition duration-300 dark:bg-bg-surface/55 dark:shadow-none ${
                  isFull
                    ? 'hover:border-teal-500/35 hover:shadow-[0_20px_50px_-24px_rgba(15,118,110,0.18)]'
                    : 'hover:-translate-y-1 hover:border-teal-500/30 hover:shadow-[0_20px_48px_-28px_rgba(15,23,42,0.14)] dark:hover:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)]'
                }`}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(ellipse 90% 70% at 90% 10%, rgba(45,212,191,0.09), transparent 52%)',
                  }}
                  aria-hidden
                />

                <div
                  className={`relative flex h-full flex-col p-5 sm:p-6 ${isFull ? 'lg:flex-row lg:items-center lg:gap-10 lg:p-8' : ''}`}
                >
                  {!isFull && tag ? (
                    <span className="mb-3 inline-flex w-fit rounded-full border border-teal-600/15 bg-teal-500/[0.07] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-800 dark:border-teal-400/25 dark:bg-teal-500/10 dark:text-teal-300">
                      {tag}
                    </span>
                  ) : null}

                  <div
                    className={`flex min-w-0 flex-1 gap-4 ${isFull ? 'lg:min-h-0 lg:items-center lg:gap-8' : ''}`}
                  >
                    <span
                      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-600/25 ring-1 ring-white/15 transition duration-300 group-hover:scale-[1.03] group-hover:shadow-teal-500/30 dark:from-teal-500 dark:to-cyan-600 ${
                        isHero ? 'h-14 w-14 sm:h-16 sm:w-16' : isFull ? 'h-14 w-14 lg:h-16 lg:w-16' : 'h-11 w-11 sm:h-12 sm:w-12'
                      }`}
                    >
                      <Icon className={isHero ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-5 w-5 sm:h-6 sm:w-6'} strokeWidth={1.75} aria-hidden />
                    </span>

                    <div className="min-w-0 flex-1">
                      {isFull && tag ? (
                        <span className="mb-2 inline-flex w-fit rounded-full border border-teal-600/15 bg-teal-500/[0.07] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-800 dark:border-teal-400/25 dark:bg-teal-500/10 dark:text-teal-300">
                          {tag}
                        </span>
                      ) : null}
                      <h3
                        className={`font-[Outfit,system-ui,sans-serif] font-semibold leading-snug tracking-tight text-text-primary ${
                          isHero ? 'text-xl sm:text-2xl' : isFull ? 'text-lg sm:text-xl lg:text-2xl' : 'text-base sm:text-lg'
                        }`}
                      >
                        {label}
                      </h3>
                      <p
                        className={`mt-2 leading-relaxed text-text-secondary ${isHero ? 'text-sm sm:text-base' : 'text-sm sm:text-[0.9375rem]'}`}
                      >
                        {description}
                      </p>
                    </div>
                  </div>

                  {isFull ? (
                    <div className="relative mt-6 flex shrink-0 items-end justify-end lg:mt-0 lg:w-[min(100%,280px)]">
                      <svg
                        viewBox="0 0 120 48"
                        className="h-16 w-full max-w-[200px] text-teal-500/35 opacity-90 dark:text-teal-400/40"
                        aria-hidden
                      >
                        <path
                          d="M4 38 L22 28 L38 34 L54 18 L70 26 L86 12 L102 20 L116 8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="116" cy="8" r="3" fill="currentColor" />
                      </svg>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
