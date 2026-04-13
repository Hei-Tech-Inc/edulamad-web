import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type {
  CompleteFlashcardSessionResponse,
  DueCardRow,
  FlashcardDeckDetailResponse,
  FlashcardDeckListItem,
  FlashcardProgress,
  FlashcardSessionMode,
  ReviewFlashcardResponse,
  StartFlashcardSessionResponse,
} from '@/api/types/flashcards.types';
import { isApiError } from '@/lib/api-error';

function asArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  return [];
}

export function useFlashcardDecksForCourse(courseId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: courseId
      ? queryKeys.flashcards.decksByCourse(courseId)
      : ['flashcards', 'decks', 'course', 'none'],
    enabled: Boolean(courseId && enabled),
    queryFn: async ({ signal }) => {
      if (!courseId) return [];
      const { data } = await apiClient.get<unknown>(
        API.flashcardDecks.byCourse(courseId),
        { signal },
      );
      return asArray<FlashcardDeckListItem>(data);
    },
    retry: (count, err) => {
      if (isApiError(err) && (err.status === 404 || err.status === 403)) return false;
      return count < 2;
    },
  });
}

export function useFlashcardDeckDetail(deckId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: deckId ? queryKeys.flashcards.deck(deckId) : ['flashcards', 'deck', 'none'],
    enabled: Boolean(deckId && enabled),
    queryFn: async ({ signal }) => {
      if (!deckId) throw new Error('Missing deck id');
      const { data } = await apiClient.get<FlashcardDeckDetailResponse>(
        API.flashcardDecks.deck(deckId),
        { signal },
      );
      return data;
    },
  });
}

export function useFlashcardDue(deckId: string | undefined, limit = 20, enabled = true) {
  return useQuery({
    queryKey: deckId ? queryKeys.flashcards.due(deckId) : ['flashcards', 'due', 'none'],
    enabled: Boolean(deckId && enabled),
    queryFn: async ({ signal }) => {
      if (!deckId) return [];
      const { data } = await apiClient.get<unknown>(API.flashcardDecks.due(deckId), {
        signal,
        params: { limit },
      });
      return asArray<DueCardRow>(data);
    },
  });
}

export function useFlashcardWeak(deckId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: deckId ? queryKeys.flashcards.weak(deckId) : ['flashcards', 'weak', 'none'],
    enabled: Boolean(deckId && enabled),
    queryFn: async ({ signal }) => {
      if (!deckId) return [];
      const { data } = await apiClient.get<unknown>(API.flashcardDecks.weak(deckId), {
        signal,
      });
      return asArray<DueCardRow>(data);
    },
  });
}

export function useFlashcardProgress(deckId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: deckId ? queryKeys.flashcards.progress(deckId) : ['flashcards', 'progress', 'none'],
    enabled: Boolean(deckId && enabled),
    queryFn: async ({ signal }) => {
      if (!deckId) throw new Error('Missing deck id');
      const { data } = await apiClient.get<FlashcardProgress>(
        API.flashcardDecks.progress(deckId),
        { signal },
      );
      return data;
    },
  });
}

export function useStartFlashcardSession() {
  return useMutation({
    mutationFn: async (body: { deckId: string; mode: FlashcardSessionMode }) => {
      const { data } = await apiClient.post<StartFlashcardSessionResponse>(
        API.flashcardSessions.root,
        body,
      );
      return data;
    },
  });
}

export function useReviewFlashcardCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      cardId: string;
      deckId: string;
      rating: number;
      sessionId: string;
    }) => {
      const { data } = await apiClient.post<ReviewFlashcardResponse>(
        API.flashcardCards.review(body.cardId),
        {
          deckId: body.deckId,
          rating: body.rating,
          sessionId: body.sessionId,
        },
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });
}

export function useCompleteFlashcardSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      sessionId: string;
      cardsStudied: number;
      cardsCorrect: number;
      cardsSkipped: number;
      durationSeconds: number;
    }) => {
      const { data } = await apiClient.patch<CompleteFlashcardSessionResponse>(
        API.flashcardSessions.complete(body.sessionId),
        {
          cardsStudied: body.cardsStudied,
          cardsCorrect: body.cardsCorrect,
          cardsSkipped: body.cardsSkipped,
          durationSeconds: body.durationSeconds,
        },
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.gamification.me });
    },
  });
}

/** Parallel summary: total due cards + first deck to jump to (for dashboard). */
export function useFlashcardDueOverview(courseIds: string[]) {
  const sorted = [...courseIds].sort().join(',');
  return useQuery({
    queryKey: ['flashcards', 'due-overview', sorted] as const,
    enabled: courseIds.length > 0,
    staleTime: 60_000,
    queryFn: async ({ signal }) => {
      let totalDue = 0;
      let topDeck: { deckId: string; courseId: string; due: number; title: string } | null =
        null;

      await Promise.all(
        courseIds.map(async (courseId) => {
          const { data: raw } = await apiClient.get<unknown>(
            API.flashcardDecks.byCourse(courseId),
            { signal },
          );
          const decks = asArray<FlashcardDeckListItem>(raw);
          for (const d of decks) {
            const deckId = d._id;
            try {
              const { data: prog } = await apiClient.get<FlashcardProgress>(
                API.flashcardDecks.progress(deckId),
                { signal },
              );
              const due = prog.dueCards ?? 0;
              totalDue += due;
              if (
                due > 0 &&
                (!topDeck || due > topDeck.due)
              ) {
                topDeck = {
                  deckId,
                  courseId,
                  due,
                  title: d.title,
                };
              }
            } catch {
              /* ignore per-deck failures */
            }
          }
        }),
      );

      return { totalDue, topDeck };
    },
  });
}
