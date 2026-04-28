/** Normalise list-like API payloads (items/data/results arrays). */
export function pickArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const rec = data as Record<string, unknown>;
    for (const key of ['items', 'data', 'results', 'rows']) {
      const next = rec[key];
      if (Array.isArray(next)) return next;
    }
  }
  return [];
}

export function rowId(row: unknown): string {
  if (!row || typeof row !== 'object') return '';
  const o = row as Record<string, unknown>;
  const raw = o._id ?? o.id ?? o.uuid;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number') return String(raw);
  return '';
}
