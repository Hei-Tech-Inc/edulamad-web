#!/usr/bin/env node
/**
 * Lightweight API smoke check for local/staging (no browser).
 * Uses API_BASE (default http://127.0.0.1:5003).
 *
 * Skip in CI without backend: E2E_SKIP_API=1
 */
const base = (process.env.API_BASE || 'http://127.0.0.1:5003').replace(/\/$/, '');

if (process.env.E2E_SKIP_API === '1') {
  console.log('[e2e-api-smoke] Skipped (E2E_SKIP_API=1)');
  process.exit(0);
}

async function get(path) {
  const url = `${base}${path}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  return { url, res };
}

async function main() {
  const health = await get('/health');
  if (!health.res.ok) {
    console.error(`[e2e-api-smoke] FAIL ${health.url} -> ${health.res.status}`);
    process.exit(1);
  }
  console.log(`[e2e-api-smoke] OK ${health.url} -> ${health.res.status}`);

  const spec = await get('/api-json');
  if (!spec.res.ok) {
    console.warn(`[e2e-api-smoke] WARN ${spec.url} -> ${spec.res.status} (OpenAPI not served?)`);
  } else {
    console.log(`[e2e-api-smoke] OK ${spec.url} -> ${spec.res.status}`);
  }
}

main().catch((err) => {
  console.error('[e2e-api-smoke] FAIL:', err.message || err);
  process.exit(1);
});
