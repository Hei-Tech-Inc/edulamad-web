/**
 * Public marketing surfaces should never show legacy aquaculture product names
 * when `NEXT_PUBLIC_APP_NAME` is misconfigured.
 */
export function getMarketingBrandName(): string {
  const raw = process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'Edulamad';
  if (/fish|aquaculture|\bfarm\b|fish\s*farm|nsuo/i.test(raw)) return 'Edulamad';
  return raw;
}
