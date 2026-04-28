/** Flatten a row for client-side search (admin JSON lists). */
export function rowSearchText(row: Record<string, unknown>): string {
  return Object.entries(row)
    .map(([k, v]) => `${k} ${formatCell(v)}`)
    .join(' ')
    .toLowerCase();
}

function formatCell(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
