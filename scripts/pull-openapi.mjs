#!/usr/bin/env node
/**
 * Fetch OpenAPI JSON from a running API (default: http://127.0.0.1:5003/api-json).
 *
 * Usage:
 *   npm run openapi:pull
 *   OPENAPI_URL=http://127.0.0.1:5003/api-json npm run openapi:pull
 *
 * After pulling, run: npm run verify:api && npm run build
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outPath = path.join(root, 'contexts', 'api-docs.json');
const backupPath = path.join(root, 'contexts', 'api-docs.backup.json');

const url =
  process.env.OPENAPI_URL?.trim() ||
  process.env.NEXT_PUBLIC_OPENAPI_SPEC_URL?.trim() ||
  'http://127.0.0.1:5003/api-json';

async function main() {
  console.log(`[pull-openapi] Fetching ${url}`);
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) {
    console.error(`[pull-openapi] HTTP ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error('[pull-openapi] Response is not valid JSON');
    process.exit(1);
  }
  if (fs.existsSync(outPath)) {
    fs.copyFileSync(outPath, backupPath);
    console.log(`[pull-openapi] Backed up previous spec to contexts/api-docs.backup.json`);
  }
  fs.writeFileSync(outPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  console.log(`[pull-openapi] Wrote ${outPath}`);
  console.log('[pull-openapi] Next: npm run verify:api && npm run build');
}

main().catch((err) => {
  console.error('[pull-openapi] Failed:', err.message || err);
  process.exit(1);
});
