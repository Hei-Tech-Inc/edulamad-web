import React, { useMemo, useState, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import {
  Code2,
  Copy,
  KeyRound,
  Trash2,
  Shield,
  Pencil,
  Check,
  ExternalLink,
  GraduationCap,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './Toast'
import {
  API_KEY_SCOPES,
  scopeGroup,
} from '@/api/types/api-keys.types'
import {
  useApiKeysList,
  useCreateApiKey,
  useRevokeApiKey,
  useUpdateApiKeyScopes,
} from '@/hooks/api-keys/useApiKeys'
import { AppApiError } from '@/lib/api-error'
import { SkeletonNotificationRow } from '@/components/ui/skeleton'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

function groupScopes() {
  const m = new Map()
  for (const s of API_KEY_SCOPES) {
    const g = scopeGroup(s)
    if (!m.has(g)) m.set(g, [])
    m.get(g).push(s)
  }
  return m
}

const SCOPE_GROUPS = groupScopes()

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'Edulamad'

export default function DeveloperApiKeysPage({ previewMode = false }) {
  const { hasRole } = useAuth()
  const { showToast } = useToast()
  const canManage = !previewMode && hasRole('admin')

  const { data: keys = [], isLoading, error, refetch, isFetching } =
    useApiKeysList({ enabled: !previewMode })
  const createMut = useCreateApiKey()
  const revokeMut = useRevokeApiKey()
  const scopesMut = useUpdateApiKeyScopes()

  const [createOpen, setCreateOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formScopes, setFormScopes] = useState(
    () => new Set(['questions.read', 'institutions.read']),
  )
  const [formRateLimit, setFormRateLimit] = useState('')
  const [formExpires, setFormExpires] = useState('')

  const [revealedOnce, setRevealedOnce] = useState(null)
  const [editKey, setEditKey] = useState(null)
  const [editScopes, setEditScopes] = useState(() => new Set())

  const errMessage = useMemo(() => {
    if (!error) return ''
    if (error instanceof AppApiError) return error.message
    if (error instanceof Error) return error.message
    return 'Failed to load API keys.'
  }, [error])

  const toggleScope = useCallback((scope, setFn) => {
    setFn((prev) => {
      const next = new Set(prev)
      if (next.has(scope)) next.delete(scope)
      else next.add(scope)
      return next
    })
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    const name = formName.trim()
    if (!name) {
      showToast('Name is required', 'error')
      return
    }
    if (formScopes.size === 0) {
      showToast('Select at least one scope', 'error')
      return
    }
    const payload = {
      name,
      scopes: [...formScopes],
    }
    const rl = formRateLimit.trim()
    if (rl !== '') {
      const n = Number(rl)
      if (Number.isFinite(n) && n >= 1) payload.rateLimitPerDay = n
    }
    if (formExpires.trim())
      payload.expiresAt = new Date(formExpires).toISOString()

    try {
      const created = await createMut.mutateAsync(payload)
      setCreateOpen(false)
      setFormName('')
      setFormScopes(new Set(['questions.read', 'institutions.read']))
      setFormRateLimit('')
      setFormExpires('')
      showToast('API key created', 'success')
      if (typeof created.key === 'string' && created.key.length > 0) {
        setRevealedOnce({
          key: created.key,
          name: created.name,
          id: created.id,
        })
      } else {
        showToast(
          'The server did not return the secret in the response. Use an API version that returns `key` once on create.',
          'error',
        )
      }
    } catch (err) {
      const msg =
        err instanceof AppApiError ? err.message : 'Could not create API key.'
      showToast(msg, 'error')
    }
  }

  const copySecret = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast('Copied', 'success')
    } catch {
      showToast('Copy failed', 'error')
    }
  }

  const handleRevoke = async (row) => {
    if (
      !window.confirm(
        `Revoke API key "${row.name}"? Integrations using it will stop working.`,
      )
    )
      return
    try {
      await revokeMut.mutateAsync(row.id)
      showToast('Key revoked', 'success')
    } catch (err) {
      const msg =
        err instanceof AppApiError ? err.message : 'Could not revoke key.'
      showToast(msg, 'error')
    }
  }

  const openEditScopes = (row) => {
    setEditKey(row)
    setEditScopes(new Set(row.scopes ?? []))
  }

  const saveEditScopes = async () => {
    if (!editKey || editScopes.size === 0) {
      showToast('Select at least one scope', 'error')
      return
    }
    try {
      await scopesMut.mutateAsync({
        id: editKey.id,
        scopes: [...editScopes],
      })
      showToast('Scopes updated', 'success')
      setEditKey(null)
    } catch (err) {
      const msg =
        err instanceof AppApiError ? err.message : 'Could not update scopes.'
      showToast(msg, 'error')
    }
  }

  const card =
    'rounded-xl border border-white/10 bg-[#111827]/95 text-slate-100 shadow-[0_16px_38px_rgba(0,0,0,0.32)]'
  const btnPrimary =
    'inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50'
  const btnGhost =
    'inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-50'

  return (
    <>
      <Head>
        <title>Developer — API keys · {APP_NAME}</title>
      </Head>
      <div
        className={
          previewMode
            ? 'min-h-screen bg-[#0a1020] text-slate-100'
            : 'text-slate-100'
        }
      >
        {previewMode ? (
          <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 dark:border-orange-500/35 dark:bg-orange-500/10 dark:text-orange-300">
                  <GraduationCap className="h-4 w-4" strokeWidth={2} />
                </span>
                {APP_NAME}
              </Link>
              <Link
                href="/login?next=%2Fdeveloper%2Fapi-keys"
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                Sign in
              </Link>
            </div>
          </header>
        ) : null}

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-300">
                  <Code2 className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-white">
                    Developer
                  </h1>
                  <p className="text-sm text-slate-300">
                    API keys for integrations and automation (organisation-scoped).{' '}
                    <Link
                      href="/developer/api-reference"
                      className="font-medium text-orange-300 hover:text-orange-200"
                    >
                      OpenAPI reference
                    </Link>
                  </p>
                </div>
              </div>
            </div>
            {canManage ? (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className={btnPrimary}
              >
                <KeyRound className="h-4 w-4" />
                Create API key
              </button>
            ) : previewMode ? (
              <Link
                href="/login?next=%2Fdeveloper%2Fapi-keys"
                className={`${btnPrimary} text-center no-underline`}
              >
                <KeyRound className="h-4 w-4" />
                Sign in to manage keys
              </Link>
            ) : null}
          </div>

          {previewMode ? (
            <div
              className={`mb-6 flex gap-3 border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-950 dark:border-orange-500/30 dark:bg-orange-950/20 dark:text-orange-100 ${card}`}
            >
              <Code2 className="h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400" />
              <p>
                <strong className="font-semibold">Preview.</strong> You can explore
                this screen without signing in. API lists and create/revoke actions
                will work after you sign in and integrate the backend.
              </p>
            </div>
          ) : null}

          {!previewMode && !canManage ? (
            <div
              className={`mb-6 flex gap-3 border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 ${card}`}
            >
              <Shield className="h-5 w-5 shrink-0 text-amber-300" />
              <p>
                Only organisation owners and admins can create or revoke API keys.
                Contact your administrator if you need access.
              </p>
            </div>
          ) : null}

          <div className={`mb-6 space-y-3 p-5 ${card}`}>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <ExternalLink className="h-4 w-4 text-slate-300" />
              Using keys (industry practice)
            </h2>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-300">
              <li>
                Send the key in the{' '}
                <code className="rounded bg-white/[0.05] px-1.5 py-0.5 text-orange-300">
                  X-Api-Key
                </code>{' '}
                header on HTTP requests (see OpenAPI security schemes).
              </li>
              <li>
                The secret value is shown only once at creation — store it in a
                vault or env var; never commit it to source control.
              </li>
              <li>
                Rotate by creating a new key, switching clients, then revoking the
                old key. Use narrow scopes (least privilege).
              </li>
            </ul>
          </div>

          {!previewMode && errMessage ? (
            <div className={`mb-6 ${card}`}>
              <ErrorState error={errMessage} onRetry={() => void refetch()} />
            </div>
          ) : null}

          <div className={`overflow-hidden ${card}`}>
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="font-medium text-white">API keys</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Keys belong to your current organisation. Listing never includes the
                full secret.
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-2 px-5 py-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonNotificationRow key={`api-key-skeleton-${i}`} />
                ))}
              </div>
            ) : keys.length === 0 ? (
              <div className="px-5 py-8">
                <EmptyState
                  title={previewMode ? 'No keys in preview mode' : 'No API keys yet'}
                  subtitle={
                    previewMode
                      ? "Sign in to load your organisation's keys from the API."
                      : canManage
                        ? `Create one to integrate external tools with ${APP_NAME}.`
                        : 'Your administrator can create keys for this organisation.'
                  }
                  actionLabel={canManage ? 'Create API key' : undefined}
                  onAction={canManage ? () => setCreateOpen(true) : undefined}
                />
              </div>
            ) : (
              <ul className="divide-y divide-white/10">
                {keys.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">
                        {row.name}
                      </p>
                      <p className="mt-1 font-mono text-xs text-slate-400">
                        {row.keyPrefix || row.prefix || row.id}
                      </p>
                      {row.scopes?.length ? (
                        <p className="mt-2 line-clamp-2 text-xs text-slate-300">
                          {row.scopes.join(', ')}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs text-slate-400">
                        {row.createdAt
                          ? `Created ${new Date(row.createdAt).toLocaleString()}`
                          : null}
                        {row.expiresAt
                          ? ` · Expires ${new Date(row.expiresAt).toLocaleString()}`
                          : ''}
                        {row.rateLimitPerDay != null
                          ? ` · ${row.rateLimitPerDay}/day`
                          : ''}
                      </p>
                    </div>
                    {canManage ? (
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          className={btnGhost}
                          onClick={() => openEditScopes(row)}
                        >
                          <Pencil className="h-4 w-4" />
                          Scopes
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200 hover:bg-red-950/50 disabled:opacity-50"
                          onClick={() => handleRevoke(row)}
                          disabled={revokeMut.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                          Revoke
                        </button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            {isFetching && !isLoading ? (
              <p className="border-t border-white/10 px-5 py-2 text-center text-xs text-slate-400">
                Refreshing…
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl"
            role="dialog"
            aria-labelledby="create-key-title"
          >
            <h2 id="create-key-title" className="text-lg font-semibold text-white">
              Create API key
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Choose a label and scopes. You can change scopes later; the secret is
              one-time only.
            </p>
            <form onSubmit={handleCreate} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-300">Name</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="e.g. Production ETL"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Scopes
                </label>
                <div className="max-h-48 space-y-3 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950/80 p-3">
                  {[...SCOPE_GROUPS.entries()].map(([group, scopes]) => (
                    <div key={group}>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                        {group}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {scopes.map((s) => (
                          <label
                            key={s}
                            className="flex cursor-pointer items-center gap-1.5 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs hover:border-slate-600"
                          >
                            <input
                              type="checkbox"
                              checked={formScopes.has(s)}
                              onChange={() =>
                                toggleScope(s, setFormScopes)
                              }
                              className="rounded border-slate-600 text-orange-600"
                            />
                            {s}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-300">
                    Max requests / day (optional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formRateLimit}
                    onChange={(e) => setFormRateLimit(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                    placeholder="Default on server"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-300">
                    Expires (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formExpires}
                    onChange={(e) => setFormExpires(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className={btnGhost}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending}
                  className={btnPrimary}
                >
                  {createMut.isPending ? 'Creating…' : 'Create key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {revealedOnce?.key ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-emerald-500/30 bg-slate-900 p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <Check className="h-6 w-6 shrink-0 text-emerald-400" />
              <div>
                <h2 className="font-semibold text-white">Save this secret now</h2>
                <p className="mt-1 text-sm text-slate-400">
                  This is the only time you will see the full key for{' '}
                  <strong className="text-slate-200">{revealedOnce.name}</strong>.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-xs break-all text-orange-200 sm:text-sm">
              <span className="flex-1">{revealedOnce.key}</span>
              <button
                type="button"
                onClick={() => copySecret(revealedOnce.key)}
                className="shrink-0 rounded p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Copy key"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setRevealedOnce(null)}
              className={`mt-6 w-full ${btnPrimary}`}
            >
              I have stored the key securely
            </button>
          </div>
        </div>
      ) : null}

      {editKey ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white">
              Update scopes — {editKey.name}
            </h2>
            <div className="mt-4 max-h-56 space-y-3 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950/80 p-3">
              {[...SCOPE_GROUPS.entries()].map(([group, scopes]) => (
                <div key={group}>
                  <p className="mb-1 text-xs font-medium uppercase text-slate-500">
                    {group}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {scopes.map((s) => (
                      <label
                        key={s}
                        className="flex cursor-pointer items-center gap-1.5 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={editScopes.has(s)}
                          onChange={() => toggleScope(s, setEditScopes)}
                          className="rounded border-slate-600 text-orange-600"
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditKey(null)}
                className={btnGhost}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditScopes}
                disabled={scopesMut.isPending}
                className={btnPrimary}
              >
                {scopesMut.isPending ? 'Saving…' : 'Save scopes'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
