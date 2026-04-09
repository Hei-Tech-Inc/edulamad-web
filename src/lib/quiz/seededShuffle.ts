/** Deterministic PRNG for reproducible quiz draws (share links use the same seed). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79fd) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithSeed<T>(items: readonly T[], seed: number): T[] {
  const arr = [...items];
  const rnd = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

export function pickQuizSubset<T extends { id: string }>(
  items: readonly T[],
  count: number,
  seed: number,
): T[] {
  const sorted = [...items].sort((a, b) => a.id.localeCompare(b.id));
  const n = Math.max(0, Math.min(Math.floor(count), sorted.length));
  if (n === 0) return [];
  const shuffled = shuffleWithSeed(sorted, seed);
  return shuffled.slice(0, n);
}
