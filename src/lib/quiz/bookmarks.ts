export type QuizBookmark = {
  id: string;
  href: string;
  title: string;
  savedAt: string;
};

const STORAGE_KEY = 'edulamad.quiz.bookmarks.v1';

function randomId(): string {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `bk_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  } catch {
    return `bk_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

export function loadQuizBookmarks(): QuizBookmark[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is Record<string, unknown> =>
          x != null && typeof x === 'object' && typeof x.href === 'string' && typeof x.title === 'string',
      )
      .map((x) => ({
        id: typeof x.id === 'string' ? x.id : randomId(),
        href: x.href as string,
        title: x.title as string,
        savedAt: typeof x.savedAt === 'string' ? x.savedAt : new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

export function saveQuizBookmark(entry: Omit<QuizBookmark, 'id' | 'savedAt'> & { id?: string }): QuizBookmark {
  const list = loadQuizBookmarks();
  const next: QuizBookmark = {
    id: entry.id ?? randomId(),
    href: entry.href,
    title: entry.title,
    savedAt: new Date().toISOString(),
  };
  const withoutDup = list.filter((b) => b.href !== next.href);
  const merged = [next, ...withoutDup].slice(0, 40);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return next;
}

export function removeQuizBookmark(id: string): void {
  const list = loadQuizBookmarks().filter((b) => b.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
