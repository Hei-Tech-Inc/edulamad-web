import type { DueCardRow } from '@/api/types/flashcards.types';

export type StoredFlashcardSession = {
  sessionId: string;
  deckId: string;
  mode: string;
  cards: DueCardRow[];
  startedAt: number;
};

const PREFIX = 'edulamad.flashcardSession.';

export function saveFlashcardSessionPayload(sessionId: string, payload: StoredFlashcardSession): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(
      `${PREFIX}${sessionId}`,
      JSON.stringify(payload),
    );
  } catch {
    /* quota / private mode */
  }
}

export function loadFlashcardSessionPayload(sessionId: string): StoredFlashcardSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(`${PREFIX}${sessionId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredFlashcardSession;
    if (!parsed?.cards || !Array.isArray(parsed.cards)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearFlashcardSessionPayload(sessionId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(`${PREFIX}${sessionId}`);
  } catch {
    /* ignore */
  }
}
