/** Product name for UI copy. Set `NEXT_PUBLIC_APP_NAME` in `.env.local`. */
export function getAppName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'Edulamad';
}
