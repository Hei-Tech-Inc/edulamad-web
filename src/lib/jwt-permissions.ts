import type { Permission } from '@/api/types/common.types';

/** Decode JWT payload without verification (permissions claim only). */
export function permissionsFromAccessToken(
  accessToken: string | null | undefined,
): Permission[] {
  if (!accessToken || typeof accessToken !== 'string') return [];
  const parts = accessToken.split('.');
  if (parts.length < 2) return [];
  try {
    const segment = parts[1];
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const pad = '='.repeat((4 - (base64.length % 4)) % 4);
    const json = globalThis.atob(base64 + pad);
    const payload = JSON.parse(json) as Record<string, unknown>;
    const out: string[] = [];
    const pushArr = (v: unknown) => {
      if (!Array.isArray(v)) return;
      for (const x of v) {
        if (typeof x === 'string' && x.trim()) out.push(x.trim());
      }
    };
    pushArr(payload.permissions);
    pushArr(payload.authorities);
    if (typeof payload.scope === 'string' && payload.scope.trim()) {
      for (const part of payload.scope.split(/[\s,]+/)) {
        if (part.trim()) out.push(part.trim());
      }
    }
    return out.filter((x): x is Permission => typeof x === 'string' && x.length > 0);
  } catch {
    return [];
  }
}
