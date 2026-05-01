'use client';

import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type BackgroundDecorationProps = {
  className?: string;
  children?: ReactNode;
};

/**
 * Soft radial yellow glow — works best on light surfaces; in dark theme the multiply layer
 * is toned down. Prefer wrapping sections rather than full `min-h-screen` unless intentional.
 */
export function SoftYellowGlowBackground({ className, children }: BackgroundDecorationProps) {
  return (
    <div className={cn('relative min-h-full w-full bg-bg-base', className)}>
      <div
        className="pointer-events-none absolute inset-0 z-0 dark:opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #fff991 0%, transparent 70%)',
          opacity: 0.6,
          mixBlendMode: 'multiply',
        }}
        aria-hidden
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

const GRID_SPHERE_STYLE: CSSProperties = {
  backgroundColor: 'var(--bg-base)',
  backgroundImage: `
    linear-gradient(to right, rgba(71, 85, 105, 0.22) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(71, 85, 105, 0.22) 1px, transparent 1px),
    radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.18) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 80%)
  `,
  backgroundSize: '32px 32px, 32px 32px, 100% 100%',
};

/**
 * Grid + violet radial layer only — use as `absolute inset-0` under hero or section content.
 * Does not include an outer surface; parent should be `relative` (or pass `className` with positioning).
 */
export function GridSphereLayer({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0', className)}
      style={GRID_SPHERE_STYLE}
      aria-hidden
    />
  );
}

/**
 * Grid + soft violet radial — decorative only; pair with `text-text-primary` / surfaces from the
 * design tokens so contrast stays valid in both themes.
 */
export function GridSphereBackground({ className, children }: BackgroundDecorationProps) {
  return (
    <div className={cn('relative min-h-full w-full bg-bg-base', className)}>
      <GridSphereLayer className="z-0" />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
