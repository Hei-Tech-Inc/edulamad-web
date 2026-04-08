import { AppApiError } from '@/lib/api-error';

/** User-facing message for sign-in and other auth calls (includes validation lines when present). */
export function formatAuthErrorMessage(e: unknown): string {
  if (e instanceof AppApiError) {
    const lines = [e.message.trim() || 'Request failed'];
    if (e.details?.length) {
      for (const d of e.details) {
        const field = d.field != null ? String(d.field) : 'field';
        const msg = d.message != null ? String(d.message) : '';
        lines.push(`• ${field}: ${msg}`);
      }
    }
    return lines.join('\n');
  }
  if (e instanceof Error && e.message.trim()) {
    return e.message.trim();
  }
  return 'Something went wrong. Try again.';
}
