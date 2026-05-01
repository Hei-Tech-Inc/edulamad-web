'use client';

import { useRef, type ReactNode } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { cn } from '@/lib/utils';

export type ContainerScrollProps = {
  /** Sticky label above the card (kept subtle so FeatureSection owns the headline). */
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Outer scroll track height; ignored when reduced motion is on. */
  scrollTrackClassName?: string;
  /**
   * `end` = visual on the right (default); `start` = visual on the left
   * (`FeatureSection` with `flip`) so the stack hugs the copy column.
   */
  align?: 'start' | 'end';
  /**
   * Skip perspective tilt + shrink — keeps previews crisp (e.g. quiz UI reads “flat”,
   * not skewed when scrolling through the sticky section).
   */
  flatMotion?: boolean;
};

/**
 * Scroll-driven scale on a sticky stack (Aceternity-style “device” reveal).
 * Pairs with tall content: outer track scrolls; inner stays pinned while the card scales.
 */
export function ContainerScroll({
  title,
  children,
  className,
  scrollTrackClassName = 'min-h-[82vh] sm:min-h-[88vh]',
  align = 'end',
  flatMotion = false,
}: ContainerScrollProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const skipTilt = reduceMotion || flatMotion;

  const scale = useTransform(
    scrollYProgress,
    [0, 0.85],
    skipTilt ? [1, 1] : [1, 0.9],
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.85],
    skipTilt ? [0, 0] : [10, 0],
  );
  const titleOpacity = useTransform(
    scrollYProgress,
    [0, 0.25],
    skipTilt ? [1, 1] : [1, 0.35],
  );

  const titleJustify =
    align === 'start' ? 'lg:justify-start' : 'lg:justify-end';
  const stickyItems =
    align === 'start'
      ? 'lg:items-start lg:pl-2'
      : 'lg:items-end lg:pr-2';

  if (reduceMotion) {
    return (
      <div
        ref={ref}
        className={cn('relative w-full', className)}
      >
        {title ? (
          <div
            className={cn(
              'mb-6 flex justify-center',
              titleJustify,
            )}
          >
            {title}
          </div>
        ) : null}
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn('relative w-full', scrollTrackClassName, className)}
    >
      <div
        className={cn(
          'sticky top-[max(4.5rem,8svh)] z-10 mx-auto flex w-full max-w-2xl flex-col items-center gap-6 lg:max-w-none',
          stickyItems,
        )}
      >
        {title ? (
          <motion.div
            style={{ opacity: titleOpacity }}
            className={cn('flex w-full justify-center', titleJustify)}
          >
            {title}
          </motion.div>
        ) : null}
        <motion.div
          style={{
            scale,
            rotateX,
            ...(flatMotion ? {} : { transformPerspective: 1200 }),
          }}
          className={cn(
            'relative w-full origin-top',
            flatMotion ? '' : '[transform-style:preserve-3d]',
          )}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
