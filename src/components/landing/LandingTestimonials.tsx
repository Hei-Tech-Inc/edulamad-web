'use client';

import { useCallback, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { getMarketingBrandName } from '@/lib/landing-brand';
import {
  TestimonialsMarqueeSection,
  type PortraitTestimonial,
} from '@/components/ui/testimonial-v2';

const BRAND = getMarketingBrandName();

/** Deterministic illustrated avatars (DiceBear) — no stock-photo hosting dependency. */
function testimonialAvatar(seed: string): string {
  const q = new URLSearchParams({
    seed,
    size: '128',
  });
  return `https://api.dicebear.com/9.x/notionists/svg?${q.toString()}`;
}

/** Portrait + quote rows for the marquee. */
export const LANDING_MARQUEE_TESTIMONIALS: PortraitTestimonial[] = [
  {
    text: `Finally one catalog for our cohort — papers by year and course without digging through three WhatsApp groups the night before exams.`,
    image: testimonialAvatar('Ama Appiah'),
    name: 'Ama Appiah',
    role: 'Course rep · Biological sciences',
  },
  {
    text: `Timed runs feel closer to the hall than silently reading PDFs. Flagging questions and seeing weak topics changed how I revise.`,
    image: testimonialAvatar('Kwesi Boateng'),
    name: 'Kwesi Boateng',
    role: 'Final-year student · Engineering',
  },
  {
    text: `When marking schemes exist we see them; when they don’t, the labeled AI steps beat anonymous screenshots in the chat.`,
    image: testimonialAvatar('Yasmine Owusu'),
    name: 'Yasmine Owusu',
    role: 'Teaching assistant · Mathematics',
  },
  {
    text: `Departments get fewer “send the PDF” pings — uploads are structured so societies and reps aren’t re-sharing the same scans.`,
    image: testimonialAvatar('Prof. Kwame Asante'),
    name: 'Prof. Kwame Asante',
    role: 'HoD delegate · Public university',
  },
  {
    text: `Our study group runs quizzes off one bank; streaks and readiness stats settle arguments about what to revise first.`,
    image: testimonialAvatar('Nadia Ibrahim'),
    name: 'Nadia Ibrahim',
    role: 'Peer tutor · Computer science',
  },
  {
    text: `${BRAND} turned revision nights from random rereading into targeted practice — analytics show where we actually leak marks.`,
    image: testimonialAvatar('Ekow Mensah'),
    name: 'Ekow Mensah',
    role: 'President · Student society',
  },
  {
    text: `Exam-week stress dropped once everyone stopped chasing whichever file hit the group chat last — one workspace won.`,
    image: testimonialAvatar('Joel Koomson'),
    name: 'Joel Koomson',
    role: 'Medicine · Clinical years',
  },
  {
    text: `Course reps see which modules spike late-night attempts — we line up support before results day, not after complaints.`,
    image: testimonialAvatar('Selasi Doku'),
    name: 'Selasi Doku',
    role: 'Faculty administrator · Sciences',
  },
  {
    text: `Past papers, schemes where they exist, and practice that respects hall timing — that combo is what we were missing.`,
    image: testimonialAvatar('Bright Narh'),
    name: 'Bright Narh',
    role: 'Graduate assistant · Economics',
  },
];

/** Phrases revealed through the spotlight veil (move the pointer over the section). */
const spotlightHints: readonly { label: string; top: string; left: string }[] = [
  { label: 'Timed exam mode — hall pressure, on screen', top: '12%', left: '5%' },
  { label: 'Every answer labeled: official · community · AI', top: '38%', left: '8%' },
  { label: 'Past papers by school, course & session', top: '20%', left: '58%' },
  { label: 'Weak-topic radar — revise where you leak marks', top: '58%', left: '10%' },
  { label: 'Reps & faculties upload into one catalog', top: '72%', left: '50%' },
];

export function LandingTestimonials() {
  const reduceMotion = useReducedMotion();
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);

  const updateSpot = useCallback(
    (clientX: number, clientY: number, el: HTMLElement) => {
      if (reduceMotion) return;
      const r = el.getBoundingClientRect();
      const x = ((clientX - r.left) / Math.max(r.width, 1)) * 100;
      const y = ((clientY - r.top) / Math.max(r.height, 1)) * 100;
      setSpot({ x, y });
    },
    [reduceMotion],
  );

  const onPointerLeave = useCallback(() => {
    setSpot(null);
  }, []);

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-marquee-heading"
      className="relative scroll-mt-28 overflow-hidden border-y border-[var(--border-subtle)] bg-gradient-to-b from-bg-base via-bg-surface/80 to-bg-base"
      onMouseMove={(e) => updateSpot(e.clientX, e.clientY, e.currentTarget)}
      onMouseLeave={onPointerLeave}
      onTouchMove={(e) => {
        const t = e.touches[0];
        if (t) updateSpot(t.clientX, t.clientY, e.currentTarget);
      }}
      onTouchEnd={onPointerLeave}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_100%,rgba(45,212,191,0.09),transparent_60%)]"
        aria-hidden
      />

      {!reduceMotion ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
            aria-hidden
          >
            <div
              className="absolute inset-0 opacity-[0.2] dark:opacity-[0.12]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, var(--border-default) 1px, transparent 0)`,
                backgroundSize: '28px 28px',
              }}
            />
            {spotlightHints.map((h) => (
              <p
                key={h.label}
                className="absolute max-w-[13rem] font-[Outfit,system-ui,sans-serif] text-[13px] font-semibold leading-snug text-teal-800/95 dark:text-teal-200/95 sm:max-w-[15rem] sm:text-sm"
                style={{ top: h.top, left: h.left }}
              >
                {h.label}
              </p>
            ))}
          </div>
          <div
            className="pointer-events-none absolute inset-0 z-[2]"
            style={
              spot
                ? {
                    backgroundColor: 'var(--bg-base)',
                    opacity: 0.93,
                    maskImage: `radial-gradient(ellipse min(340px, 48vw) min(260px, 38vw) at ${spot.x}% ${spot.y}%, transparent 0%, black 68%)`,
                    WebkitMaskImage: `radial-gradient(ellipse min(340px, 48vw) min(260px, 38vw) at ${spot.x}% ${spot.y}%, transparent 0%, black 68%)`,
                  }
                : {
                    backgroundColor: 'var(--bg-base)',
                    opacity: 0.94,
                  }
            }
          />
        </>
      ) : null}

      <div className="relative z-10">
        <TestimonialsMarqueeSection
          embedded
          items={LANDING_MARQUEE_TESTIMONIALS}
          eyebrow="Testimonials"
          title="Trusted where exams actually happen"
          description="From reps keeping banks coherent to students sitting timed practice — voices from campuses using one surface for papers, answers, and revision signals."
          columnDurations={[15, 19, 17]}
          className="bg-transparent py-20 sm:py-24"
        />
      </div>
    </section>
  );
}
