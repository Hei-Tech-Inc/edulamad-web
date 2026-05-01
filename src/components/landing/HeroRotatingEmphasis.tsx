'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

type HeroRotatingEmphasisProps = {
  phrases: string[];
  /** Cycle interval when motion is allowed. */
  intervalMs?: number;
  className?: string;
};

/**
 * Cycles short headline phrases (21st-style “text rotate” pattern, minimal — framer-motion only).
 */
export function HeroRotatingEmphasis({
  phrases,
  intervalMs = 3200,
  className = '',
}: HeroRotatingEmphasisProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const safe = phrases.length > 0 ? phrases : [''];
  const current = safe[index % safe.length] ?? '';

  useEffect(() => {
    if (reduceMotion || safe.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((n) => (n + 1) % safe.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, reduceMotion, safe.length]);

  const emphasis = (
    <span className={className}>{current}</span>
  );

  if (reduceMotion || safe.length <= 1) {
    return emphasis;
  }

  return (
    <span className="relative inline-block min-h-[1.25em] overflow-visible align-bottom [padding-block-end:0.06em]">
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className={`block overflow-visible pb-[0.08em] [text-wrap:balance] ${className}`.trim()}
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
