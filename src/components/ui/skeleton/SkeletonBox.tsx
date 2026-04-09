import type { CSSProperties } from 'react'

export interface SkeletonBoxProps {
  width: number | string
  height: number
  borderRadius?: number
  style?: CSSProperties
  className?: string
}

/**
 * Base skeleton primitive for all loading placeholders.
 * Web implementation uses CSS keyframes (no shimmer dependency).
 */
export default function SkeletonBox({
  width,
  height,
  borderRadius = 8,
  style,
  className = '',
}: SkeletonBoxProps) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-box ${className}`.trim()}
      style={
        {
          width,
          height,
          borderRadius,
          ...style,
        } as CSSProperties
      }
    />
  )
}
