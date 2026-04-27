#!/usr/bin/env node
/**
 * Report OpenAPI paths from a spec file that are not covered in src/api/endpoints.ts
 * Usage: OPENAPI_PATH=contexts/api-docs.live.json node scripts/diff-openapi-coverage.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const docPath = process.env.OPENAPI_PATH
  ? path.join(root, process.env.OPENAPI_PATH)
  : path.join(root, 'contexts', 'api-docs.json');
const stubPath = path.join(root, 'contexts', 'api-path-stubs.json');
const endpointsPath = path.join(root, 'src', 'api', 'endpoints.ts');

const doc = JSON.parse(fs.readFileSync(docPath, 'utf8'));
const endpointsSrc = fs.readFileSync(endpointsPath, 'utf8');

let stubPaths = [];
try {
  if (fs.existsSync(stubPath)) {
    const stubDoc = JSON.parse(fs.readFileSync(stubPath, 'utf8'));
    stubPaths = Object.keys(stubDoc.paths || {});
  }
} catch {
  /* ignore */
}

const openApiPaths = [...new Set([...Object.keys(doc.paths || {}), ...stubPaths])].sort();

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

console.log(`[diff-openapi-coverage] spec: ${path.relative(root, docPath)}`);
console.log(`[diff-openapi-coverage] paths in spec: ${openApiPaths.length}`);
console.log(`[diff-openapi-coverage] missing from endpoints.ts: ${missing.length}`);
if (missing.length) {
  for (const m of missing) console.log(`  ${m}`);
  process.exit(1);
}

process.exit(0);
