'use client';

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
  // SVG: small payload; avatars render with <img> (not next/image) so the optimizer never calls DiceBear.
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

export function LandingTestimonials() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-marquee-heading"
      className="relative scroll-mt-28 overflow-hidden border-y border-[var(--border-subtle)] bg-gradient-to-b from-bg-base via-bg-surface/80 to-bg-base"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_100%,rgba(45,212,191,0.09),transparent_60%)]"
        aria-hidden
      />
      <TestimonialsMarqueeSection
        embedded
        items={LANDING_MARQUEE_TESTIMONIALS}
        eyebrow="Testimonials"
        title="Trusted where exams actually happen"
        description="From reps keeping banks coherent to students sitting timed practice — voices from campuses using one surface for papers, answers, and revision signals."
        columnDurations={[15, 19, 17]}
        className="bg-transparent py-20 sm:py-24"
      />
    </section>
  );
}
