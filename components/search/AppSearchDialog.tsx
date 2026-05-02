'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Hash, Search, UserRound, X } from 'lucide-react';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { fetchCatalogSearch } from '@/lib/catalog-search';
import { useAuthStore } from '@/stores/auth.store';
import type { CatalogSearchResponse } from '@/api/types/catalog-search.types';

export interface AppSearchDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Semantic tokens + Tailwind: readable in `[data-theme="light"]` and dark (`globals.css`). */
const shell =
  'border-[color:var(--border-default)] bg-bg-surface text-text-primary shadow-float';
const muted = 'text-text-muted';
const secondary = 'text-text-secondary';
const hitBorder = 'border-[color:var(--border-subtle)]';
const stickyHeader = 'bg-bg-surface/95 text-text-secondary backdrop-blur-sm';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Highlights whitespace-separated query tokens (plain text only). */
export function highlightSearchText(text: string, query: string): ReactNode {
  const t = String(text ?? '');
  const q = query.trim();
  if (!q || q.length < 2) return t;
  const parts = q.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return t;
  const re = new RegExp(`(${parts.map(escapeRegExp).join('|')})`, 'gi');
  const chunks = t.split(re);
  return chunks.map((chunk, i) =>
    i % 2 === 1 ? (
      <mark
        key={`h-${i}-${chunk.slice(0, 12)}`}
        className="rounded-sm bg-brand-dim px-0.5 text-text-primary dark:bg-orange-500/30"
      >
        {chunk}
      </mark>
    ) : (
      chunk
    ),
  );
}

function normalizeUserSearchHits(raw: unknown): Array<{ id: string; name: string; email: string }> {
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown }).items)
      ? ((raw as { items: unknown[] }).items ?? [])
      : raw && typeof raw === 'object' && Array.isArray((raw as { users?: unknown }).users)
        ? ((raw as { users: unknown[] }).users ?? [])
        : raw && typeof raw === 'object' && Array.isArray((raw as { hits?: unknown }).hits)
          ? ((raw as { hits: unknown[] }).hits ?? [])
          : [];

  return list.map((item, i) => {
    const o = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    const id = String(o.id ?? o.userId ?? o._id ?? `row-${i}`);
    const email = typeof o.email === 'string' ? o.email : '';
    const fn = typeof o.firstName === 'string' ? o.firstName : '';
    const ln = typeof o.lastName === 'string' ? o.lastName : '';
    const joined = [fn, ln].filter(Boolean).join(' ').trim();
    const name =
      typeof o.name === 'string'
        ? o.name
        : typeof o.fullName === 'string'
          ? o.fullName
          : joined || email || 'User';
    return { id, name, email };
  });
}

function ResultsSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={`sk-${i}`}
          className="h-14 animate-pulse rounded-xl bg-bg-hover"
        />
      ))}
    </div>
  );
}

function totalHits(data: CatalogSearchResponse | undefined): number {
  if (!data) return 0;
  return (
    data.questions.length +
    data.courses.length +
    data.universities.length +
    data.flashcardDecks.length +
    data.practiceQuestions.length
  );
}

type NavKind = 'question' | 'course' | 'deck' | 'practice' | 'person';

interface NavTarget {
  kind: NavKind;
  id: string;
  email?: string;
}

function buildNavTargets(
  catalogData: CatalogSearchResponse | undefined,
  people: Array<{ id: string; email: string }> | undefined,
  includePeople: boolean,
): NavTarget[] {
  const out: NavTarget[] = [];
  if (!catalogData) return out;
  for (const row of catalogData.questions) {
    out.push({ kind: 'question', id: row._id });
  }
  for (const row of catalogData.courses) {
    out.push({ kind: 'course', id: row._id });
  }
  for (const row of catalogData.flashcardDecks) {
    out.push({ kind: 'deck', id: row._id });
  }
  for (const row of catalogData.practiceQuestions) {
    out.push({ kind: 'practice', id: row._id });
  }
  if (includePeople && people) {
    for (const p of people) {
      out.push({ kind: 'person', id: p.id, email: p.email });
    }
  }
  return out;
}

export default function AppSearchDialog({ open, onClose }: AppSearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchText.trim()), 220);
    return () => window.clearTimeout(id);
  }, [searchText]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('app.recent-searches');
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, 8));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchText('');
      setDebouncedSearch('');
      setActiveIndex(null);
      return;
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    setActiveIndex(null);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const profileGateQ = useQuery({
    queryKey: queryKeys.students.onboardingGate,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.students.meProfile, { signal });
      return data;
    },
    enabled: open && Boolean(accessToken),
    staleTime: 60_000,
    retry: false,
  });

  const rawProfile = profileGateQ.data;
  const profileUniversityId =
    rawProfile &&
    typeof rawProfile === 'object' &&
    typeof (rawProfile as { universityId?: unknown }).universityId === 'string'
      ? String((rawProfile as { universityId: string }).universityId).trim()
      : undefined;

  const catalogQuery = debouncedSearch.trim();
  const courseIdFromRoute =
    typeof router.query.courseId === 'string' ? router.query.courseId : undefined;
  const universityIdFromRoute =
    typeof router.query.universityId === 'string' ? router.query.universityId : undefined;

  const effectiveUniversityId = universityIdFromRoute ?? profileUniversityId;

  const catalogQ = useQuery({
    queryKey: [
      'app-search-catalog',
      catalogQuery,
      courseIdFromRoute ?? '',
      effectiveUniversityId ?? '',
    ],
    enabled: open && catalogQuery.length >= 2,
    queryFn: async ({ signal }) =>
      fetchCatalogSearch(
        {
          q: catalogQuery,
          limit: 12,
          ...(courseIdFromRoute ? { courseId: courseIdFromRoute } : {}),
          ...(effectiveUniversityId ? { universityId: effectiveUniversityId } : {}),
        },
        signal,
      ),
  });

  const peopleQ = useQuery({
    queryKey: ['app-search-people', catalogQuery],
    enabled: open && catalogQuery.length >= 2 && Boolean(accessToken),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<unknown>(API.search.users, {
        signal,
        params: { q: catalogQuery, limit: 8 },
      });
      return normalizeUserSearchHits(data);
    },
    retry: false,
  });

  const navTargets = useMemo(
    () =>
      buildNavTargets(
        catalogQ.data,
        peopleQ.data,
        Boolean(accessToken) && catalogQuery.length >= 2,
      ),
    [catalogQ.data, peopleQ.data, accessToken, catalogQuery.length],
  );

  useEffect(() => {
    setActiveIndex((i) => {
      if (i == null) return null;
      const n = navTargets.length;
      if (n === 0) return null;
      return i >= n ? n - 1 : i;
    });
  }, [navTargets]);

  const saveRecentSearch = useCallback((value: string) => {
    const next = [value, ...recentSearches.filter((s) => s !== value)].slice(0, 8);
    setRecentSearches(next);
    try {
      window.localStorage.setItem('app.recent-searches', JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [recentSearches]);

  const activateNavTarget = useCallback(
    (t: NavTarget) => {
      if (debouncedSearch) saveRecentSearch(debouncedSearch);
      switch (t.kind) {
        case 'question':
        case 'practice':
          onClose();
          void router.push(`/questions/${encodeURIComponent(t.id)}`);
          break;
        case 'course':
          onClose();
          void router.push(`/courses/${encodeURIComponent(t.id)}`);
          break;
        case 'deck':
          onClose();
          void router.push(`/flashcards/decks/${encodeURIComponent(t.id)}`);
          break;
        case 'person':
          if (t.email) {
            window.location.href = `mailto:${encodeURIComponent(t.email)}`;
          }
          break;
        default:
          break;
      }
    },
    [debouncedSearch, onClose, router, saveRecentSearch],
  );

  const goQuestion = useCallback(
    (id: string) => {
      if (debouncedSearch) saveRecentSearch(debouncedSearch);
      onClose();
      void router.push(`/questions/${encodeURIComponent(id)}`);
    },
    [debouncedSearch, onClose, router, saveRecentSearch],
  );

  useEffect(() => {
    if (!open || activeIndex == null || activeIndex < 0) return undefined;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-search-hit-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeIndex, open, navTargets.length]);

  useEffect(() => {
    if (!open) return undefined;

    const onNavKey = (e: KeyboardEvent) => {
      const n = navTargets.length;
      if (n === 0) return;

      const fromSearchInput = e.target === inputRef.current;

      if (e.key === 'ArrowDown') {
        if (fromSearchInput && activeIndex === null) {
          return;
        }
        e.preventDefault();
        setActiveIndex((prev) => {
          if (prev === null) return 0;
          return Math.min(prev + 1, n - 1);
        });
        return;
      }

      if (e.key === 'ArrowUp') {
        if (fromSearchInput && activeIndex === null) {
          return;
        }
        e.preventDefault();
        setActiveIndex((prev) => {
          if (prev === null || prev === 0) {
            inputRef.current?.focus();
            return null;
          }
          return prev - 1;
        });
        return;
      }

      if (e.key === 'Enter' && activeIndex != null && navTargets[activeIndex]) {
        e.preventDefault();
        activateNavTarget(navTargets[activeIndex]);
      }
    };

    document.addEventListener('keydown', onNavKey, true);
    return () => document.removeEventListener('keydown', onNavKey, true);
  }, [open, navTargets, activeIndex, activateNavTarget]);

  const catalogData = catalogQ.data;

  const navIndex = useMemo(() => {
    const d = catalogData;
    const nQ = d?.questions.length ?? 0;
    const nC = d?.courses.length ?? 0;
    const nD = d?.flashcardDecks.length ?? 0;
    const nPQ = d?.practiceQuestions.length ?? 0;
    const nPe =
      accessToken && catalogQuery.length >= 2 ? (peopleQ.data?.length ?? 0) : 0;
    return {
      course0: nQ,
      deck0: nQ + nC,
      pq0: nQ + nC + nD,
      people0: nQ + nC + nD + nPQ,
      total: nQ + nC + nD + nPQ + nPe,
    };
  }, [catalogData, accessToken, catalogQuery.length, peopleQ.data?.length]);

  const nCatalog = totalHits(catalogData);
  const nPeople = peopleQ.data?.length ?? 0;
  const isLoading =
    (catalogQ.isFetching && catalogQuery.length >= 2) ||
    (peopleQ.isFetching && catalogQuery.length >= 2 && Boolean(accessToken));

  const statusLine = useMemo(() => {
    if (catalogQuery.length < 2) {
      return 'Type at least 2 characters · ⌘K anytime · ↑↓ to browse results';
    }
    if (catalogQ.isLoading && !catalogData) return 'Searching catalog…';
    if (!catalogQ.isError && catalogData) {
      const parts: string[] = [];
      if (nCatalog > 0) parts.push(`${nCatalog} in catalog`);
      if (accessToken && !peopleQ.isError && nPeople > 0) parts.push(`${nPeople} people`);
      return parts.length > 0 ? parts.join(' · ') : 'No matches';
    }
    return '';
  }, [
    catalogQuery.length,
    catalogQ.isLoading,
    catalogQ.isError,
    catalogData,
    nCatalog,
    nPeople,
    accessToken,
    peopleQ.isError,
  ]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="presentation"
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/45 p-0 backdrop-blur-sm dark:bg-slate-950/80 sm:items-start sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal
            aria-label="Search catalog and people"
            className={`flex max-h-[min(560px,92vh)] w-full max-w-2xl flex-col overflow-hidden rounded-none ${shell} sm:mt-[max(2rem,8vh)] sm:max-h-[min(640px,85vh)] sm:rounded-2xl`}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center gap-2 border-b ${hitBorder} px-3 py-3 sm:px-4`}>
              <Search className="h-5 w-5 shrink-0 text-brand" aria-hidden />
              <input
                ref={inputRef}
                type="search"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setActiveIndex(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' && navTargets.length > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveIndex(0);
                  }
                }}
                placeholder="Search questions, courses, decks, people…"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Search query"
                aria-activedescendant={
                  activeIndex != null ? `search-hit-${activeIndex}` : undefined
                }
                aria-controls="search-results-list"
                className="h-11 min-w-0 flex-1 bg-transparent text-base text-text-primary placeholder:text-text-muted focus:outline-none sm:text-sm"
              />
              <kbd
                className={`hidden shrink-0 rounded border ${hitBorder} bg-bg-raised px-1.5 py-0.5 font-mono text-[10px] text-text-muted sm:inline-block`}
              >
                esc
              </kbd>
              <button
                type="button"
                onClick={onClose}
                className={`rounded-lg border ${hitBorder} p-2 text-text-secondary transition hover:bg-bg-hover`}
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {effectiveUniversityId && !universityIdFromRoute ? (
              <p className={`border-b ${hitBorder} px-4 py-2 text-xs ${muted}`}>
                Scoped to your university for better matches (change profile under{' '}
                <Link
                  href="/courses"
                  className="font-medium text-brand underline-offset-2 hover:underline"
                  onClick={onClose}
                >
                  My Courses
                </Link>
                ).
              </p>
            ) : null}

            {recentSearches.length > 0 && catalogQuery.length < 2 ? (
              <div className={`flex flex-wrap gap-2 border-b ${hitBorder} px-4 py-3`}>
                <span className={`w-full text-xs font-medium uppercase tracking-wide ${muted}`}>
                  Recent
                </span>
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSearchText(s)}
                    className={`rounded-full border ${hitBorder} bg-bg-raised px-3 py-1.5 text-xs text-text-secondary transition hover:bg-bg-hover`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}

            <p className={`px-4 pt-2 text-xs ${muted}`}>{statusLine}</p>

            <div
              ref={listRef}
              id="search-results-list"
              className="min-h-0 flex-1 overflow-y-auto"
              role="listbox"
              aria-label="Search results"
            >
              {catalogQuery.length >= 2 && isLoading && !catalogData ? <ResultsSkeleton /> : null}

              {catalogQ.isError ? (
                <div className="p-4 text-sm text-amber-800 dark:text-amber-200">
                  Catalog search failed. Ensure <code className="rounded bg-bg-hover px-1 text-text-primary">GET /search</code>{' '}
                  is live and CORS allows this origin.
                </div>
              ) : null}

              {!catalogQ.isLoading &&
              !catalogQ.isError &&
              catalogQuery.length >= 2 &&
              catalogData &&
              nCatalog === 0 &&
              !(accessToken && nPeople > 0) ? (
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                  <Hash className={`h-10 w-10 ${muted}`} aria-hidden />
                  <p className={`max-w-sm text-sm ${secondary}`}>
                    No catalog matches. Try different keywords — people results may appear below if you are
                    signed in.
                  </p>
                </div>
              ) : null}

              {catalogData && nCatalog > 0 ? (
                <div className={`divide-y ${hitBorder}`}>
                  {catalogData.questions.length > 0 ? (
                    <section>
                      <h3
                        className={`sticky top-0 z-[1] flex items-center gap-2 ${stickyHeader} px-4 py-2 text-xs font-semibold uppercase tracking-wide`}
                      >
                        <BookOpen className="h-3.5 w-3.5" aria-hidden />
                        Questions
                      </h3>
                      <ul>
                        {catalogData.questions.map((row, i) => {
                          const active = activeIndex === i;
                          return (
                            <li key={row._id} role="presentation">
                              <button
                                type="button"
                                id={active ? `search-hit-${i}` : undefined}
                                data-search-hit-index={i}
                                role="option"
                                aria-selected={active}
                                onClick={() => goQuestion(row._id)}
                                onMouseEnter={() => setActiveIndex(i)}
                                className={`w-full px-4 py-3 text-left transition hover:bg-bg-hover ${
                                  active ? 'bg-bg-hover ring-1 ring-inset ring-[color:var(--brand-orange)]/35' : ''
                                }`}
                              >
                                <p className={`line-clamp-2 text-sm text-text-primary`}>
                                  {highlightSearchText(row.questionText || 'Question', catalogQuery)}
                                </p>
                                <p className={`mt-1 text-xs ${muted}`}>
                                  {[row.type, row.topic, row.difficulty != null ? String(row.difficulty) : '']
                                    .filter(Boolean)
                                    .join(' · ') || 'Open'}
                                </p>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ) : null}

                  {catalogData.courses.length > 0 ? (
                    <section>
                      <h3
                        className={`sticky top-0 z-[1] flex items-center gap-2 ${stickyHeader} px-4 py-2 text-xs font-semibold uppercase tracking-wide`}
                      >
                        Courses
                      </h3>
                      <ul>
                        {catalogData.courses.map((row, i) => {
                          const flat = navIndex.course0 + i;
                          const active = activeIndex === flat;
                          return (
                            <li key={row._id} role="presentation">
                              <button
                                type="button"
                                id={active ? `search-hit-${flat}` : undefined}
                                data-search-hit-index={flat}
                                role="option"
                                aria-selected={active}
                                onClick={() => {
                                  if (debouncedSearch) saveRecentSearch(debouncedSearch);
                                  onClose();
                                  void router.push(`/courses/${encodeURIComponent(row._id)}`);
                                }}
                                onMouseEnter={() => setActiveIndex(flat)}
                                className={`w-full px-4 py-3 text-left transition hover:bg-bg-hover ${
                                  active ? 'bg-bg-hover ring-1 ring-inset ring-[color:var(--brand-orange)]/35' : ''
                                }`}
                              >
                                <p className="text-sm font-medium text-text-primary">
                                  {highlightSearchText(
                                    [row.code, row.title].filter(Boolean).join(' — ') || 'Course',
                                    catalogQuery,
                                  )}
                                </p>
                                {row.level != null && row.level !== '' ? (
                                  <p className={`mt-1 text-xs ${muted}`}>Level {String(row.level)}</p>
                                ) : null}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ) : null}

                  {catalogData.universities.length > 0 ? (
                    <section>
                      <h3
                        className={`sticky top-0 z-[1] ${stickyHeader} px-4 py-2 text-xs font-semibold uppercase tracking-wide`}
                      >
                        Universities
                      </h3>
                      <ul>
                        {catalogData.universities.map((row) => (
                          <li key={row._id} className={`px-4 py-3 ${secondary}`}>
                            <p className="text-sm text-text-primary">
                              {highlightSearchText(
                                [row.name, row.acronym].filter(Boolean).join(' · ') || 'University',
                                catalogQuery,
                              )}
                            </p>
                            <p className={`mt-1 text-xs ${muted}`}>
                              Use this name when choosing your school on My Courses or onboarding.
                            </p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {catalogData.flashcardDecks.length > 0 ? (
                    <section>
                      <h3
                        className={`sticky top-0 z-[1] ${stickyHeader} px-4 py-2 text-xs font-semibold uppercase tracking-wide`}
                      >
                        Flashcard decks
                      </h3>
                      <ul>
                        {catalogData.flashcardDecks.map((row, i) => {
                          const flat = navIndex.deck0 + i;
                          const active = activeIndex === flat;
                          return (
                            <li key={row._id} role="presentation">
                              <button
                                type="button"
                                id={active ? `search-hit-${flat}` : undefined}
                                data-search-hit-index={flat}
                                role="option"
                                aria-selected={active}
                                onClick={() => {
                                  if (debouncedSearch) saveRecentSearch(debouncedSearch);
                                  onClose();
                                  void router.push(`/flashcards/decks/${encodeURIComponent(row._id)}`);
                                }}
                                onMouseEnter={() => setActiveIndex(flat)}
                                className={`w-full px-4 py-3 text-left transition hover:bg-bg-hover ${
                                  active ? 'bg-bg-hover ring-1 ring-inset ring-[color:var(--brand-orange)]/35' : ''
                                }`}
                              >
                                <p className="text-sm text-text-primary">
                                  {highlightSearchText(row.title || 'Deck', catalogQuery)}
                                </p>
                                {row.courseId ? (
                                  <p className={`mt-1 text-xs ${muted}`}>Course {row.courseId}</p>
                                ) : null}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ) : null}

                  {catalogData.practiceQuestions.length > 0 ? (
                    <section>
                      <h3
                        className={`sticky top-0 z-[1] ${stickyHeader} px-4 py-2 text-xs font-semibold uppercase tracking-wide`}
                      >
                        Practice bank
                      </h3>
                      <ul>
                        {catalogData.practiceQuestions.map((row, i) => {
                          const flat = navIndex.pq0 + i;
                          const active = activeIndex === flat;
                          return (
                            <li key={row._id} role="presentation">
                              <button
                                type="button"
                                id={active ? `search-hit-${flat}` : undefined}
                                data-search-hit-index={flat}
                                role="option"
                                aria-selected={active}
                                onClick={() => {
                                  if (debouncedSearch) saveRecentSearch(debouncedSearch);
                                  onClose();
                                  void router.push(`/questions/${encodeURIComponent(row._id)}`);
                                }}
                                onMouseEnter={() => setActiveIndex(flat)}
                                className={`w-full px-4 py-3 text-left transition hover:bg-bg-hover ${
                                  active ? 'bg-bg-hover ring-1 ring-inset ring-[color:var(--brand-orange)]/35' : ''
                                }`}
                              >
                                <p className={`line-clamp-2 text-sm text-text-primary`}>
                                  {highlightSearchText(row.questionText || 'Question', catalogQuery)}
                                </p>
                                {row.difficulty != null ? (
                                  <p className={`mt-1 text-xs ${muted}`}>
                                    Difficulty {String(row.difficulty)}
                                  </p>
                                ) : null}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ) : null}
                </div>
              ) : null}

              {accessToken && catalogQuery.length >= 2 ? (
                <section className={`border-t ${hitBorder}`}>
                  <h3
                    className={`flex items-center gap-2 bg-bg-surface/95 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-secondary backdrop-blur-sm`}
                  >
                    <UserRound className="h-3.5 w-3.5" aria-hidden />
                    People
                    <span className={`font-normal normal-case ${muted}`}>(signed in)</span>
                  </h3>
                  {peopleQ.isLoading ? (
                    <div className="p-4">
                      <div className="h-12 animate-pulse rounded-xl bg-bg-hover" />
                    </div>
                  ) : null}
                  {peopleQ.isError ? (
                    <p className={`px-4 py-3 text-xs ${secondary}`}>
                      Directory search unavailable (enable Meilisearch /{' '}
                      <code className="rounded bg-bg-hover px-1 text-text-primary">FEATURE_SEARCH_ENABLED</code>{' '}
                      on the API).
                    </p>
                  ) : null}
                  {!peopleQ.isLoading && peopleQ.data && peopleQ.data.length > 0 ? (
                    <ul>
                      {peopleQ.data.map((p, i) => {
                        const flat = navIndex.people0 + i;
                        const active = activeIndex === flat;
                        return (
                          <li
                            key={p.id}
                            role="presentation"
                            className={`flex items-start gap-3 border-b ${hitBorder} px-4 py-3 last:border-b-0`}
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-dim text-sm font-semibold text-brand">
                              {(p.name || p.email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <button
                                type="button"
                                id={active ? `search-hit-${flat}` : undefined}
                                data-search-hit-index={flat}
                                role="option"
                                aria-selected={active}
                                onMouseEnter={() => setActiveIndex(flat)}
                                onClick={() => {
                                  if (debouncedSearch) saveRecentSearch(debouncedSearch);
                                  if (p.email) {
                                    window.location.href = `mailto:${encodeURIComponent(p.email)}`;
                                  }
                                }}
                                className={`w-full rounded-lg text-left transition hover:bg-bg-hover ${
                                  active ? 'bg-bg-hover ring-1 ring-inset ring-[color:var(--brand-orange)]/35' : ''
                                }`}
                              >
                                <p className="text-sm font-medium text-text-primary">
                                  {highlightSearchText(p.name, catalogQuery)}
                                </p>
                                {p.email ? (
                                  <span className="mt-0.5 block truncate text-xs font-normal text-brand hover:underline">
                                    {highlightSearchText(p.email, catalogQuery)}
                                  </span>
                                ) : null}
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                  {!peopleQ.isLoading &&
                  !peopleQ.isError &&
                  peopleQ.data &&
                  peopleQ.data.length === 0 &&
                  catalogQuery.length >= 2 ? (
                    <p className={`px-4 py-3 text-xs ${muted}`}>No people matched.</p>
                  ) : null}
                </section>
              ) : null}
            </div>

            <div className={`border-t ${hitBorder} px-4 py-2 text-[11px] ${muted}`}>
              <span className="hidden sm:inline">⌘K · ↑↓ · Enter · </span>
              Catalog is public. People requires sign-in.
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
