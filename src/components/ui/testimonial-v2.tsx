'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

export type PortraitTestimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

function partitionIntoThree<T>(items: T[]): [T[], T[], T[]] {
  const a: T[] = [];
  const b: T[] = [];
  const c: T[] = [];
  items.forEach((item, i) => {
    if (i % 3 === 0) a.push(item);
    else if (i % 3 === 1) b.push(item);
    else c.push(item);
  });
  return [a, b, c];
}

function TestimonialCard({
  text,
  image,
  name,
  role,
  duplicateSet,
  columnId,
}: PortraitTestimonial & {
  duplicateSet: number;
  columnId: string;
}) {
  return (
    <motion.li
      aria-hidden={duplicateSet === 1}
      tabIndex={duplicateSet === 1 ? -1 : 0}
      whileHover={{
        scale: 1.03,
        y: -8,
        boxShadow:
          '0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        transition: { type: 'spring', stiffness: 400, damping: 17 },
      }}
      whileFocus={{
        scale: 1.03,
        y: -8,
        boxShadow:
          '0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        transition: { type: 'spring', stiffness: 400, damping: 17 },
      }}
      className="group w-full max-w-xs cursor-default select-none rounded-3xl border border-[var(--border-default)] bg-bg-surface p-8 shadow-[var(--shadow-card)] transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/35 dark:bg-bg-surface/90"
    >
      <blockquote className="m-0 p-0">
        <p className="m-0 font-normal leading-relaxed text-text-secondary transition-colors duration-300">
          {text}
        </p>
        <footer className="mt-6 flex items-center gap-3">
          {/* unoptimized: skip optimizer fetch to DiceBear (same rationale as prior native img). */}
          <Image
            src={image}
            alt=""
            aria-hidden
            width={40}
            height={40}
            unoptimized
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-[var(--border-default)] transition-all duration-300 ease-in-out group-hover:ring-teal-500/35"
          />
          <div className="flex min-w-0 flex-col">
            <cite className="not-italic font-semibold leading-5 tracking-tight text-text-primary transition-colors duration-300">
              {name}
            </cite>
            <span className="mt-0.5 text-sm leading-5 tracking-tight text-text-muted transition-colors duration-300">
              {role}
            </span>
          </div>
        </footer>
      </blockquote>
    </motion.li>
  );
}

function TestimonialsColumn({
  className = '',
  columnId,
  testimonials,
  duration = 15,
}: {
  className?: string;
  columnId: string;
  testimonials: PortraitTestimonial[];
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (testimonials.length === 0) {
    return null;
  }

  if (reduceMotion) {
    return (
      <div className={className}>
        <ul className="m-0 flex list-none flex-col gap-6 p-0">
          {testimonials.map((t, i) => (
            <TestimonialCard key={`${columnId}-static-${i}`} {...t} duplicateSet={0} columnId={columnId} />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={className}>
      <motion.ul
        animate={{
          translateY: '-50%',
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        className="m-0 flex list-none flex-col gap-6 bg-transparent pb-6 pt-0 transition-colors duration-300"
      >
        {[0, 1].map((dup) => (
          <React.Fragment key={`${columnId}-dup-${dup}`}>
            {testimonials.map((t, i) => (
              <TestimonialCard key={`${columnId}-${dup}-${i}`} {...t} duplicateSet={dup} columnId={columnId} />
            ))}
          </React.Fragment>
        ))}
      </motion.ul>
    </div>
  );
}

export type TestimonialsMarqueeSectionProps = {
  items: PortraitTestimonial[];
  eyebrow?: string;
  title: string;
  description: string;
  /** Seconds per full loop; one per column (left → right). */
  columnDurations?: [number, number, number];
  className?: string;
  sectionId?: string;
  /** When true, renders a fragment with inner content only (wrap with your own `<section>`). */
  embedded?: boolean;
};

/**
 * Three-column infinite-scroll testimonial cards (marquee). Uses theme tokens; pauses to a
 * static grid when the user prefers reduced motion. No dark-mode toggle — use app ThemeContext.
 */
export function TestimonialsMarqueeSection({
  items,
  eyebrow = 'Testimonials',
  title,
  description,
  columnDurations = [15, 19, 17],
  className = '',
  sectionId = 'testimonials',
  embedded = false,
}: TestimonialsMarqueeSectionProps) {
  const reduceMotion = useReducedMotion();
  const [firstColumn, secondColumn, thirdColumn] = partitionIntoThree(items);

  const sectionMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24, rotate: -1 },
        whileInView: { opacity: 1, y: 0, rotate: 0 },
        viewport: { once: true, amount: 0.15 },
        transition: {
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1] as const,
          opacity: { duration: 0.8 },
        },
      };

  const inner = (
    <motion.div
      {...sectionMotion}
      className={`relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`.trim()}
    >
        <div className="mx-auto mb-12 flex max-w-[540px] flex-col items-center sm:mb-16">
          <div className="flex justify-center">
            <div
              className="rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-wide transition-colors"
              style={{
                borderColor: 'var(--border-default)',
                background: 'var(--bg-raised)',
                color: 'var(--landing-feature-eyebrow)',
              }}
            >
              {eyebrow}
            </div>
          </div>

          <h2
            id="testimonials-marquee-heading"
            className="mt-6 text-center font-[Outfit,system-ui,sans-serif] text-3xl font-extrabold tracking-tight text-text-primary transition-colors md:text-4xl lg:text-5xl"
          >
            {title}
          </h2>
          <p className="mt-5 max-w-sm text-center text-lg leading-relaxed text-text-secondary transition-colors">
            {description}
          </p>
        </div>

        {reduceMotion ? (
          <ul className="m-0 mx-auto grid max-w-6xl list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t, i) => (
              <TestimonialCard
                key={`grid-${i}-${t.name}`}
                {...t}
                duplicateSet={0}
                columnId="grid"
              />
            ))}
          </ul>
        ) : (
          <div
            className="mx-auto mt-10 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
            role="region"
            aria-label="Scrolling testimonials"
          >
            <TestimonialsColumn
              columnId="a"
              testimonials={firstColumn}
              duration={columnDurations[0]}
            />
            <TestimonialsColumn
              columnId="b"
              className="hidden md:block"
              testimonials={secondColumn}
              duration={columnDurations[1]}
            />
            <TestimonialsColumn
              columnId="c"
              className="hidden lg:block"
              testimonials={thirdColumn}
              duration={columnDurations[2]}
            />
          </div>
        )}
    </motion.div>
  );

  if (embedded) {
    return inner;
  }

  return (
    <section
      id={sectionId}
      aria-labelledby="testimonials-marquee-heading"
      className={`relative overflow-hidden py-20 sm:py-24 ${className}`.trim()}
    >
      {inner}
    </section>
  );
}
