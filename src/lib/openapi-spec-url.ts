import { getApiBaseURL } from '@/lib/api-base-url';

export type OpenAPISpec = Record<string, unknown> & {
  openapi?: string;
  info?: Record<string, unknown>;
  paths?: Record<string, unknown>;
  tags?: unknown[];
  components?: Record<string, unknown>;
};

export function isOpenApiDocument(v: unknown): v is OpenAPISpec {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  if (typeof o.openapi !== 'string') return false;
  if (!o.paths || typeof o.paths !== 'object' || Array.isArray(o.paths)) {
    return false;
  }
  return true;
}

/**
 * Ordered URLs to try (Nest commonly serves JSON at `/api-json`).
 * Override with full `NEXT_PUBLIC_OPENAPI_SPEC_URL` or path `NEXT_PUBLIC_OPENAPI_SPEC_PATH`.
 */
export function getOpenApiSpecCandidateUrls(): string[] {
  const fullOverride = process.env.NEXT_PUBLIC_OPENAPI_SPEC_URL?.trim();
  if (fullOverride) {
    return [fullOverride.replace(/\/$/, '')];
  }

  const primaryPath =
    process.env.NEXT_PUBLIC_OPENAPI_SPEC_PATH?.trim() || '/api-json';
  const fallbacks = ['/openapi.json', '/docs-json', '/api/docs-json', '/v3/api-docs'];

  const paths = [
    primaryPath.startsWith('/') ? primaryPath : `/${primaryPath}`,
    ...fallbacks,
  ];
  const uniquePaths = [...new Set(paths)];

  const base = getApiBaseURL().replace(/\/$/, '');
  return uniquePaths.map((p) => `${base}${p.startsWith('/') ? p : `/${p}`}`);
}
