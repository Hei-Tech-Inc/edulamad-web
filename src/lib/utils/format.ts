export function formatTimeAgo(value?: string | number | Date | null): string {
  if (!value) return 'just now';
  const at = new Date(value).getTime();
  if (!Number.isFinite(at)) return 'just now';
  const diffMs = Math.max(0, Date.now() - at);
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function formatDuration(valueSeconds?: number | null): string {
  if (!Number.isFinite(valueSeconds) || (valueSeconds ?? 0) <= 0) return '0s';
  const total = Math.max(0, Math.floor(valueSeconds as number));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatScore(score?: number | null, total?: number | null): string {
  if (!Number.isFinite(score) || !Number.isFinite(total) || (total ?? 0) <= 0) {
    return '—';
  }
  const safeScore = Math.max(0, Number(score));
  const safeTotal = Math.max(1, Number(total));
  const pct = Math.round((safeScore / safeTotal) * 100);
  return `${safeScore}/${safeTotal} (${pct}%)`;
}
