import { useCallback, useMemo, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import {
  BookOpen,
  Braces,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  GraduationCap,
  KeyRound,
  RefreshCw,
  Search,
  Shield,
} from 'lucide-react'
import { useOpenApiSpec } from '@/hooks/developer/useOpenApiSpec'
import { getAppName } from '@/lib/app-brand'
import { getApiBaseUrlLabel } from '@/lib/api-base-url'
import type { OpenAPISpec } from '@/lib/openapi-spec-url'

type HttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'delete'
  | 'head'
  | 'options'

const HTTP_METHODS: HttpMethod[] = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'options',
]

type OAOperation = Record<string, unknown> & {
  tags?: string[]
  summary?: string
  description?: string
  operationId?: string
  parameters?: unknown[]
  requestBody?: unknown
  responses?: Record<string, unknown>
  security?: unknown[]
}

interface ApiOperation {
  id: string
  path: string
  method: HttpMethod
  tag: string
  operation: OAOperation
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

/** Map generic boilerplate OpenAPI titles to the product name shown in the UI. */
function displayOpenApiTitle(specTitle: string, appName: string): string {
  const t = specTitle.trim()
  if (/^nestjs(\s+production)?(\s+api)?$/i.test(t)) {
    return `${appName} API`
  }
  return t
}

function refToSchemaName(ref: unknown): string | null {
  if (typeof ref !== 'string') return null
  const m = /^#\/components\/schemas\/([^/]+)$/.exec(ref)
  return m ? m[1] : null
}

function pickRefFromMedia(content: unknown): string | null {
  if (!isRecord(content)) return null
  for (const ct of Object.keys(content)) {
    const body = content[ct]
    if (!isRecord(body)) continue
    const schema = body.schema
    if (isRecord(schema) && typeof schema.$ref === 'string') {
      return refToSchemaName(schema.$ref)
    }
  }
  return null
}

function summarizeRequestBody(body: unknown): {
  schemaLabel: string | null
  contentTypes: string[]
} {
  if (!isRecord(body)) return { schemaLabel: null, contentTypes: [] }
  const content = body.content
  if (!isRecord(content)) return { schemaLabel: null, contentTypes: [] }
  const contentTypes = Object.keys(content)
  const schemaLabel = pickRefFromMedia(content)
  return { schemaLabel, contentTypes }
}

function summarizeResponses(
  responses: Record<string, unknown> | undefined,
): { code: string; description: string; schemaHint: string | null }[] {
  if (!responses) return []
  const out: { code: string; description: string; schemaHint: string | null }[] =
    []
  for (const code of Object.keys(responses)) {
    const r = responses[code]
    let description = ''
    let schemaHint: string | null = null
    if (isRecord(r)) {
      if (typeof r.description === 'string') description = r.description
      const content = r.content
      if (isRecord(content)) schemaHint = pickRefFromMedia(content)
    }
    out.push({ code, description, schemaHint })
  }
  out.sort((a, b) => {
    const na = Number(a.code)
    const nb = Number(b.code)
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb
    return a.code.localeCompare(b.code)
  })
  return out
}

function collectOperations(spec: OpenAPISpec): ApiOperation[] {
  const paths = spec.paths
  if (!isRecord(paths)) return []
  const list: ApiOperation[] = []
  for (const path of Object.keys(paths)) {
    const item = paths[path]
    if (!isRecord(item)) continue
    for (const method of HTTP_METHODS) {
      const op = item[method]
      if (!isRecord(op)) continue
      const tags = Array.isArray(op.tags)
        ? op.tags.filter((t): t is string => typeof t === 'string')
        : []
      const tag = tags[0] ?? 'default'
      const operationId =
        typeof op.operationId === 'string' ? op.operationId : ''
      const id = operationId || `${method}:${path}`
      list.push({
        id,
        path,
        method,
        tag,
        operation: op as OAOperation,
      })
    }
  }
  list.sort((a, b) => {
    const tc = a.tag.localeCompare(b.tag)
    if (tc !== 0) return tc
    const pc = a.path.localeCompare(b.path)
    if (pc !== 0) return pc
    return HTTP_METHODS.indexOf(a.method) - HTTP_METHODS.indexOf(b.method)
  })
  return list
}

function methodStyles(m: HttpMethod): string {
  const map: Record<HttpMethod, string> = {
    get:
      'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    post: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    put: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    patch: 'bg-violet-500/15 text-violet-300 border-violet-500/40',
    delete: 'bg-red-500/15 text-red-300 border-red-500/40',
    head: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
    options: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
  }
  return map[m]
}

function CornerBrackets() {
  return (
    <>
      <span
        className="pointer-events-none absolute left-2 top-2 h-5 w-5 border-l border-t border-orange-500/45"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute right-2 top-2 h-5 w-5 border-r border-t border-orange-500/45"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-2 left-2 h-5 w-5 border-b border-l border-orange-500/45"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-2 right-2 h-5 w-5 border-b border-r border-orange-500/45"
        aria-hidden
      />
    </>
  )
}

function MeshBackground({ fixed = true }: { fixed?: boolean }) {
  return (
    <div
      className={`pointer-events-none bg-[#050505] ${fixed ? 'fixed inset-0 -z-10' : 'absolute inset-0 -z-0'}`}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 55% at 50% -10%, rgba(255, 92, 0, 0.14), transparent 55%),
            radial-gradient(ellipse 50% 40% at 80% 60%, rgba(255, 92, 0, 0.06), transparent 50%),
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 52px 52px, 52px 52px',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.32]"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(255, 92, 0, 0.11) 1px, transparent 1.5px)',
          backgroundSize: '52px 52px',
        }}
      />
    </div>
  )
}

function ParameterTable({ parameters }: { parameters: unknown[] }) {
  const rows: {
    name: string
    in: string
    required: boolean
    typeHint: string
    description: string
  }[] = []
  for (const p of parameters) {
    if (!isRecord(p)) continue
    const name = typeof p.name === 'string' ? p.name : ''
    const inn = typeof p.in === 'string' ? p.in : ''
    const required = Boolean(p.required)
    let typeHint = ''
    if (isRecord(p.schema)) {
      const t = p.schema.type
      const fmt = p.schema.format
      const ref = refToSchemaName(p.schema.$ref)
      if (typeof t === 'string') typeHint = t
      if (typeof fmt === 'string') typeHint = typeHint ? `${typeHint} (${fmt})` : fmt
      if (ref) typeHint = ref
    }
    const description =
      typeof p.description === 'string' ? p.description : ''
    if (name) rows.push({ name, in: inn, required, typeHint, description })
  }
  if (rows.length === 0) return null
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-white/[0.08] bg-black/40">
      <table className="w-full text-left text-[13px] font-mono">
        <thead>
          <tr className="border-b border-white/[0.08] text-[11px] uppercase tracking-wider text-neutral-500">
            <th className="px-3 py-2 font-semibold">Name</th>
            <th className="px-3 py-2 font-semibold">In</th>
            <th className="px-3 py-2 font-semibold">Type</th>
            <th className="px-3 py-2 font-semibold">Req</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={`${r.name}-${r.in}`}
              className="border-b border-white/[0.06] text-neutral-300 last:border-0"
            >
              <td className="px-3 py-2 text-orange-300">{r.name}</td>
              <td className="px-3 py-2 text-neutral-500">{r.in}</td>
              <td className="px-3 py-2 text-neutral-400">{r.typeHint || '—'}</td>
              <td className="px-3 py-2 text-neutral-500">
                {r.required ? 'yes' : 'no'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.some((r) => r.description) ? (
        <ul className="border-t border-white/[0.08] px-3 py-2 text-[12px] text-neutral-500">
          {rows
            .filter((r) => r.description)
            .map((r) => (
              <li key={`${r.name}-desc`}>
                <span className="text-orange-300">{r.name}</span>
                {' — '}
                {r.description}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  )
}

function SchemaSnippet({
  spec,
  name,
}: {
  spec: OpenAPISpec
  name: string
}) {
  const schema =
    spec.components &&
    isRecord(spec.components) &&
    isRecord((spec.components as { schemas?: unknown }).schemas)
    ? (spec.components as { schemas: Record<string, unknown> }).schemas[name]
    : undefined
  if (!isRecord(schema)) {
    return (
      <p className="mt-2 font-mono text-[12px] text-neutral-500">
        Schema reference: {name}
      </p>
    )
  }
  const props = schema.properties
  if (isRecord(props)) {
    const required = Array.isArray(schema.required)
      ? new Set(schema.required.filter((x): x is string => typeof x === 'string'))
      : new Set<string>()
    const keys = Object.keys(props).slice(0, 24)
    return (
      <ul className="mt-2 space-y-1 font-mono text-[12px] text-neutral-400">
        {keys.map((k) => {
          const v = props[k]
          let line = ''
          if (isRecord(v)) {
            const t = typeof v.type === 'string' ? v.type : ''
            const ref = refToSchemaName(v.$ref)
            line = ref || t || 'object'
            if (Array.isArray(v.enum)) line += ' (enum)'
          }
          return (
            <li key={k}>
              <span className="text-orange-300">{k}</span>
              {required.has(k) ? (
                <span className="text-red-400/80"> *</span>
              ) : null}
              <span className="text-neutral-600"> : </span>
              <span>{line || '—'}</span>
            </li>
          )
        })}
        {Object.keys(props).length > keys.length ? (
          <li className="text-neutral-600">
            … {Object.keys(props).length - keys.length} more fields
          </li>
        ) : null}
      </ul>
    )
  }
  return (
    <pre className="mt-2 max-h-40 overflow-auto rounded-lg border border-white/[0.08] bg-black/50 p-3 text-[11px] leading-relaxed text-neutral-400">
      {JSON.stringify(schema, null, 2).slice(0, 4000)}
      {JSON.stringify(schema, null, 2).length > 4000 ? '\n…' : ''}
    </pre>
  )
}

export default function OpenApiReference({
  bundledSpec,
  previewMode = false,
  embedded = false,
}: {
  /** Snapshot from `contexts/api-docs.json` when the API is offline or unknown. */
  bundledSpec: OpenAPISpec
  previewMode?: boolean
  /** When true, background fills the parent (e.g. main column under app Layout). */
  embedded?: boolean
}) {
  const appName = getAppName()
  const apiBase = useMemo(() => getApiBaseUrlLabel(), [])
  const { spec, source, isLive, resolvedUrl, isFetching, error, refetch } =
    useOpenApiSpec(bundledSpec)

  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())

  const operations = useMemo(() => collectOperations(spec), [spec])

  const tagDescriptions = useMemo(() => {
    const m = new Map<string, string>()
    const tags = Array.isArray(spec.tags) ? spec.tags : []
    for (const t of tags) {
      if (isRecord(t) && typeof t.name === 'string') {
        const d = typeof t.description === 'string' ? t.description : ''
        m.set(t.name, d)
      }
    }
    return m
  }, [spec])

  const tagList = useMemo(() => {
    const s = new Set<string>()
    for (const o of operations) s.add(o.tag)
    return [...s].sort((a, b) => a.localeCompare(b))
  }, [operations])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = operations
    if (activeTag) list = list.filter((o) => o.tag === activeTag)
    if (!q) return list
    return list.filter((o) => {
      const hay = `${o.path} ${o.method} ${o.operation.summary ?? ''} ${o.operation.operationId ?? ''} ${o.tag}`.toLowerCase()
      return hay.includes(q)
    })
  }, [operations, query, activeTag])

  const stats = useMemo(() => {
    const pathSet = new Set(operations.map((o) => o.path))
    return {
      paths: pathSet.size,
      operations: operations.length,
      version:
        spec.info &&
        isRecord(spec.info) &&
        typeof spec.info.version === 'string'
          ? spec.info.version
          : '—',
      title:
        spec.info &&
        isRecord(spec.info) &&
        typeof spec.info.title === 'string'
          ? displayOpenApiTitle(spec.info.title, appName)
          : `${appName} API`,
    }
  }, [operations, spec.info, appName])

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const copyLine = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* ignore */
    }
  }, [])

  const downloadSpec = useCallback(() => {
    const blob = new Blob([JSON.stringify(spec, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'api-docs.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [spec])

  return (
    <>
      <Head>
        <title>API reference · {appName}</title>
        <meta
          name="description"
          content={`${appName} HTTP API — OpenAPI reference synced from your deployment when available.`}
        />
      </Head>
      <div
        className={`relative text-white ${embedded ? 'min-h-[calc(100vh-5rem)] overflow-hidden bg-[#050505]' : 'min-h-screen'}`}
      >
        <MeshBackground fixed={!embedded} />

        {previewMode ? (
          <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-black/75 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-500/35 bg-orange-500/10 text-orange-300">
                  <GraduationCap className="h-4 w-4" strokeWidth={2} />
                </span>
                {appName}
              </Link>
              <Link
                href="/login?next=%2Fdeveloper%2Fapi-reference"
                className="rounded-lg border border-orange-500/50 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-200 transition hover:border-orange-400 hover:bg-orange-500/20"
              >
                Sign in
              </Link>
            </div>
          </header>
        ) : null}

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
          <nav className="mb-6 flex flex-wrap items-center gap-3 text-[13px] text-neutral-500">
            <Link
              href="/developer/api-keys"
              className="inline-flex items-center gap-1.5 font-mono text-neutral-400 transition hover:text-orange-300"
            >
              <KeyRound className="h-3.5 w-3.5" />
              API keys
            </Link>
            <span className="text-neutral-700" aria-hidden>
              /
            </span>
            <span className="font-mono text-orange-300">HTTP API</span>
          </nav>

          <div className="mb-8 rounded-xl border border-white/[0.08] bg-black/40 p-4 font-mono text-[12px] text-neutral-400 backdrop-blur-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-500">
                  Client base URL
                </p>
                <code className="block truncate text-sm text-orange-200">{apiBase.display}</code>
                {apiBase.detail ? (
                  <p className="text-[11px] leading-snug text-neutral-600">{apiBase.detail}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {isLive ? (
                    <span className="rounded border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                      Live OpenAPI
                    </span>
                  ) : isFetching ? (
                    <span className="rounded border border-orange-500/30 bg-orange-500/5 px-2.5 py-1 text-[11px] text-orange-200">
                      Contacting API…
                    </span>
                  ) : source === 'fallback' ? (
                    <span className="rounded border border-amber-500/35 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-200">
                      Offline — bundled snapshot
                    </span>
                  ) : (
                    <span className="rounded border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-neutral-400">
                      Bundled snapshot
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => void refetch()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] px-2.5 py-1 text-[11px] font-medium text-neutral-300 hover:border-orange-500/40 hover:text-orange-200"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
                    />
                    Refresh
                  </button>
                </div>
                {resolvedUrl ? (
                  <p className="max-w-md break-all text-right text-[10px] text-neutral-600">
                    {resolvedUrl}
                  </p>
                ) : null}
                {error && !isLive ? (
                  <p className="max-w-md text-right text-[10px] text-amber-600/90">{error}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="relative mb-10 px-1 py-8 sm:px-4">
            <CornerBrackets />
            <div className="relative mx-auto max-w-3xl text-center">
              <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-orange-500">
                {`// ${appName.toLowerCase()} platform`}
              </p>
              <h1 className="text-balance font-[system-ui,Inter,sans-serif] text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {stats.title}
                <span className="text-orange-400">.</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl font-mono text-sm leading-relaxed text-neutral-400">
                Past questions, courses, and exam-prep features for Ghanaian universities —
                backed by the same HTTP contract as this web app. Paths below mirror{' '}
                <span className="text-neutral-300">contexts/api-docs.json</span> in the repo;
                when your API serves OpenAPI JSON (often{' '}
                <span className="text-neutral-500">/api-json</span> on Nest), this page loads
                the live spec automatically.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={downloadSpec}
                  className="inline-flex items-center gap-2 rounded-lg border border-white bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
                >
                  <Download className="h-4 w-4" />
                  Download JSON
                </button>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-6 font-mono text-xs text-neutral-500">
                <span>
                  <span className="text-neutral-400">OpenAPI</span>{' '}
                  {typeof spec.openapi === 'string' ? spec.openapi : '3.x'}
                </span>
                <span>
                  <span className="text-neutral-400">version</span> {stats.version}
                </span>
                <span>
                  <span className="text-neutral-400">paths</span> {stats.paths}
                </span>
                <span>
                  <span className="text-neutral-400">operations</span>{' '}
                  {stats.operations}
                </span>
              </div>
            </div>
          </div>

          <div className="relative mb-6 flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-black/35 p-4 backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-orange-500/35 bg-orange-500/10 text-orange-300">
                <Braces className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Endpoints
                </h2>
                <p className="font-mono text-[12px] text-neutral-500">
                  Search, filter by tag, expand for parameters &amp; responses.
                </p>
              </div>
            </div>
            <div className="relative flex w-full flex-col gap-2 sm:max-w-md lg:w-auto lg:min-w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter paths, summaries, operationId…"
                className="w-full rounded-lg border border-white/[0.12] bg-black/50 py-2.5 pl-10 pr-3 font-mono text-[13px] text-neutral-200 placeholder:text-neutral-600 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
              />
            </div>
          </div>

          {previewMode ? (
            <div className="mb-6 flex gap-3 rounded-lg border border-orange-500/25 bg-orange-500/5 px-4 py-3 text-sm text-orange-100/90">
              <BookOpen className="h-5 w-5 shrink-0 text-orange-400" />
              <p>
                <strong className="font-semibold text-orange-200">Preview.</strong>{' '}
                You&apos;re viewing the public API contract without signing in.
                Authenticated tools live under{' '}
                <Link
                  href="/developer/api-keys"
                  className="font-mono text-orange-300 underline decoration-orange-500/40 underline-offset-2 hover:text-orange-200"
                >
                  /developer/api-keys
                </Link>
                .
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <aside className="lg:sticky lg:top-4 lg:w-56 lg:shrink-0">
              <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3">
                <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-orange-500">
                  Tags
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTag(null)}
                  className={`mb-1 w-full rounded-md px-2 py-1.5 text-left font-mono text-[12px] transition ${
                    activeTag === null
                      ? 'bg-orange-500/15 text-orange-200'
                      : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  All ({operations.length})
                </button>
                <ul className="max-h-[50vh] space-y-0.5 overflow-y-auto pr-1 lg:max-h-[calc(100vh-12rem)]">
                  {tagList.map((t) => {
                    const c = operations.filter((o) => o.tag === t).length
                    return (
                      <li key={t}>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveTag((prev) => (prev === t ? null : t))
                          }
                          className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left font-mono text-[12px] transition ${
                            activeTag === t
                              ? 'bg-orange-500/15 text-orange-200'
                              : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
                          }`}
                        >
                          <span className="truncate">{t}</span>
                          <span className="shrink-0 text-neutral-600">{c}</span>
                        </button>
                        {activeTag === t && tagDescriptions.get(t) ? (
                          <p className="px-2 pb-2 pt-0.5 text-[11px] leading-snug text-neutral-600">
                            {tagDescriptions.get(t)}
                          </p>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/40 p-3">
                <p className="mb-2 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-orange-500">
                  <Shield className="h-3 w-3" />
                  Security
                </p>
                <ul className="space-y-2 font-mono text-[11px] text-neutral-500">
                  <li>
                    <span className="text-orange-300">JWT-auth</span> — Bearer
                  </li>
                  <li>
                    <span className="text-orange-300">ApiKey</span> — header{' '}
                    <code className="text-neutral-400">X-Api-Key</code>
                  </li>
                </ul>
              </div>
            </aside>

            <section className="min-w-0 flex-1 space-y-2">
              {filtered.length === 0 ? (
                <p className="rounded-lg border border-white/[0.08] bg-black/30 px-4 py-8 text-center font-mono text-sm text-neutral-500">
                  No operations match this filter.
                </p>
              ) : null}
              {filtered.map((op) => {
                const open = expanded.has(op.id)
                const summ =
                  typeof op.operation.summary === 'string'
                    ? op.operation.summary
                    : ''
                const opId =
                  typeof op.operation.operationId === 'string'
                    ? op.operation.operationId
                    : ''
                const params = Array.isArray(op.operation.parameters)
                  ? op.operation.parameters
                  : []
                const body = summarizeRequestBody(op.operation.requestBody)
                const responses = summarizeResponses(op.operation.responses)
                const line = `${op.method.toUpperCase()} ${op.path}`

                return (
                  <article
                    key={op.id}
                    className="overflow-hidden rounded-xl border border-white/[0.1] bg-black/45"
                  >
                    <div className="flex w-full items-start gap-2 px-4 py-3 transition hover:bg-white/[0.04]">
                      <button
                        type="button"
                        onClick={() => toggle(op.id)}
                        className="mt-0.5 shrink-0 rounded p-0.5 text-neutral-500 hover:text-white"
                        aria-expanded={open}
                      >
                        {open ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggle(op.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded border px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wide ${methodStyles(op.method)}`}
                          >
                            {op.method}
                          </span>
                          <code className="truncate text-[13px] text-neutral-200">
                            {op.path}
                          </code>
                          <span className="rounded border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-neutral-500">
                            {op.tag}
                          </span>
                        </div>
                        {summ ? (
                          <p className="mt-1 text-sm text-neutral-400">{summ}</p>
                        ) : null}
                      </button>
                      <button
                        type="button"
                        onClick={() => void copyLine(line)}
                        className="shrink-0 rounded-md border border-white/[0.1] p-1.5 text-neutral-500 hover:border-orange-500/40 hover:text-orange-300"
                        title="Copy METHOD path"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    {open ? (
                      <div className="border-t border-white/[0.08] bg-black/55 px-4 py-4 sm:px-5">
                        {opId ? (
                          <p className="font-mono text-[12px] text-neutral-500">
                            <span className="text-neutral-600">operationId</span>{' '}
                            <span className="text-orange-300">{opId}</span>
                          </p>
                        ) : null}

                        {params.length ? (
                          <>
                            <h3 className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                              Parameters
                            </h3>
                            <ParameterTable parameters={params} />
                          </>
                        ) : null}

                        {body.contentTypes.length || body.schemaLabel ? (
                          <div className="mt-4">
                            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                              Request body
                            </h3>
                            <p className="mt-1 font-mono text-[12px] text-neutral-400">
                              {body.contentTypes.join(', ') || '—'}
                              {body.schemaLabel ? (
                                <>
                                  {' '}
                                  →{' '}
                                  <span className="text-orange-300">
                                    {body.schemaLabel}
                                  </span>
                                </>
                              ) : null}
                            </p>
                            {body.schemaLabel ? (
                              <SchemaSnippet spec={spec} name={body.schemaLabel} />
                            ) : null}
                          </div>
                        ) : null}

                        <div className="mt-4">
                          <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Responses
                          </h3>
                          <ul className="mt-2 space-y-1.5 font-mono text-[12px]">
                            {responses.map((r) => (
                              <li
                                key={r.code}
                                className="flex flex-wrap gap-2 border-b border-white/[0.06] py-1.5 last:border-0"
                              >
                                <span
                                  className={
                                    r.code.startsWith('2')
                                      ? 'text-emerald-400'
                                      : r.code.startsWith('4')
                                        ? 'text-amber-400'
                                        : r.code.startsWith('5')
                                          ? 'text-red-400'
                                          : 'text-neutral-400'
                                  }
                                >
                                  {r.code}
                                </span>
                                <span className="text-neutral-500">
                                  {r.description || '—'}
                                </span>
                                {r.schemaHint ? (
                                  <span className="text-neutral-600">
                                    → {r.schemaHint}
                                  </span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </section>
          </div>

          <footer className="mt-16 border-t border-white/[0.08] pt-10">
            <p className="text-center font-[system-ui,Inter,sans-serif] text-5xl font-thin uppercase tracking-[0.25em] text-transparent sm:text-6xl [-webkit-text-stroke:1px_rgba(255,92,0,0.35)] [text-stroke:1px_rgba(255,92,0,0.35)]">
              {appName} API
            </p>
            <p className="mt-4 text-center font-mono text-[11px] text-neutral-600">
              Repo snapshot:{' '}
              <span className="text-neutral-500">contexts/api-docs.json</span>
              {isLive ? (
                <>
                  {' '}
                  · Live spec from your backend
                </>
              ) : null}
            </p>
          </footer>
        </div>
      </div>
    </>
  )
}
