#!/usr/bin/env node
/**
 * Ensures every path template in contexts/api-docs.json appears in src/api/endpoints.ts
 * (static paths as quoted literals; templated paths as ordered literal segments).
 *
 * Does not require hooks/UI for each route — only that path constants exist for the frontend contract.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const docPath = path.join(root, 'contexts', 'api-docs.json');
const endpointsPath = path.join(root, 'src', 'api', 'endpoints.ts');

const doc = JSON.parse(fs.readFileSync(docPath, 'utf8'));
const endpointsSrc = fs.readFileSync(endpointsPath, 'utf8');

const openApiPaths = Object.keys(doc.paths || {}).sort();

function coversOpenApiTemplate(template, src) {
  if (template === '/') {
    return /root:\s*['"]\/['"]/.test(src) || /['"]\/['"]/.test(src);
  }
  if (!template.includes('{')) {
    const quoted = template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`['"]${quoted}['"]`).test(src);
  }
  const segments = template.split(/\{[^}]+\}/g).filter(Boolean);
  let from = 0;
  for (const seg of segments) {
    const i = src.indexOf(seg, from);
    if (i === -1) return false;
    from = i + seg.length;
  }
  return true;
}

const missing = [];
for (const p of openApiPaths) {
  if (!coversOpenApiTemplate(p, endpointsSrc)) {
    missing.push(p);
  }
}

if (missing.length) {
  console.error(
    '[verify-openapi-endpoints] Missing from src/api/endpoints.ts (expected literals or segment order):\n',
    missing.join('\n  '),
  );
  process.exit(1);
}

console.log(
  `[verify-openapi-endpoints] OK — ${openApiPaths.length} OpenAPI paths covered in endpoints.ts`,
);
