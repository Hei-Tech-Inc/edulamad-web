import type { ValidationErrorDetail } from '@/api/types/common.types';

export interface ParsedApiError {
  message: string;
  code?: string;
  details?: ValidationErrorDetail[];
}

/** Shown when the API returns a status with no usable message body (typical for some 403s). */
function statusFallbackMessage(status: number): string {
  const map: Record<number, string> = {
    400: 'Invalid request — check the information you entered.',
    401: 'Sign-in required or your session expired.',
    403:
      'This action was blocked (403). The API did not include a specific reason.\n\n' +
      'Try: sign out and sign in again. If your organisation is new, open Pending registration or wait for an admin. If it continues, ask your organisation owner whether your role is allowed.\n\n' +
      '(Local dev: check CORS, FRONTEND_URL on the API, and NEXT_PUBLIC_API_URL / API_PROXY_TARGET.)',
    404: 'The requested resource was not found.',
    409: 'This conflicts with existing data—for example, the email may already be registered.',
    422: 'Validation failed — check the fields below.',
    429: 'Too many attempts. Please wait a moment and try again.',
    500: 'Something went wrong on the server. Try again later.',
    502: 'The API is temporarily unavailable (bad gateway).',
    503: 'The API is temporarily unavailable.',
  };
  return map[status] ?? `Request failed (HTTP ${status}).`;
}

function joinValidationDetails(details: ValidationErrorDetail[]): string {
  return details
    .map((d) => {
      const f = typeof d.field === 'string' && d.field.trim() ? d.field.trim() : '';
      const m = typeof d.message === 'string' && d.message.trim() ? d.message.trim() : '';
      if (f && m) return `${f}: ${m}`;
      return f || m || '';
    })
    .filter(Boolean)
    .join(' ');
}

/** Best-effort extraction for NestJS, Express, RFC 7807-style, and wrapped envelopes. */
function pickString(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

function isGenericTopLevelMessage(message: string | undefined): boolean {
  if (!message) return false;
  return /^(convex mutation error|internal server error|request failed|unknown error|validation failed)\.?$/i.test(
    message.trim(),
  );
}

function extractDeepMessage(
  value: unknown,
  depth = 0,
  seen: WeakSet<object> = new WeakSet(),
): string | undefined {
  if (depth > 4 || value == null) return undefined;
  if (typeof value === 'string') return pickString(value);
  if (typeof value !== 'object') return undefined;
  if (seen.has(value as object)) return undefined;
  seen.add(value as object);

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractDeepMessage(item, depth + 1, seen);
      if (found) return found;
    }
    return undefined;
  }

  const rec = value as Record<string, unknown>;
  const primaryKeys = [
    'userMessage',
    'publicMessage',
    'message',
    'detail',
    'reason',
    'description',
    'errorMessage',
  ] as const;

  for (const key of primaryKeys) {
    const candidate = pickString(rec[key]);
    if (candidate && !isGenericTopLevelMessage(candidate)) return candidate;
  }

  const nestedKeys = ['data', 'error', 'cause', 'meta', 'details', 'errors'] as const;
  for (const key of nestedKeys) {
    const found = extractDeepMessage(rec[key], depth + 1, seen);
    if (found) return found;
  }

  return undefined;
}

export function parseApiErrorPayload(
  raw: unknown,
  status: number,
): ParsedApiError {
  let code: string | undefined;
  let details: ValidationErrorDetail[] | undefined;
  let data: unknown = raw;
  let envelopeMessage: string | undefined;

  if (
    data &&
    typeof data === 'object' &&
    'success' in (data as object) &&
    (data as { success: boolean }).success === false
  ) {
    const wrap = data as Record<string, unknown>;
    envelopeMessage = pickString(wrap.message);
    if (typeof wrap.code === 'string' && wrap.code.trim()) {
      code = wrap.code.trim();
    }
    const inner = wrap.data;
    const err = wrap.error;
    if (inner && typeof inner === 'object') {
      data = inner;
    } else if (typeof err === 'string' && err.trim()) {
      return {
        message: envelopeMessage ?? err.trim(),
        code,
        details: undefined,
      };
    } else if (err && typeof err === 'object') {
      data = err;
    } else {
      /** Top-level `details` / `requestId` live on the envelope (e.g. VALIDATION_ERROR from Nest). */
      data = wrap;
    }
  }

  if (typeof data === 'string') {
    const t = data.trim();
    if (t && !t.startsWith('<') && t.length < 600) {
      return { message: t };
    }
    return { message: statusFallbackMessage(status) };
  }

  if (!data || typeof data !== 'object') {
    return { message: statusFallbackMessage(status) };
  }

  const rec = data as Record<string, unknown>;

  let message: string | undefined = envelopeMessage;

  if (typeof rec.code === 'string' && rec.code.trim()) {
    code = rec.code.trim();
  }
  if (typeof rec.message === 'string') {
    const m = pickString(rec.message);
    if (m) message = m;
  } else if (Array.isArray(rec.message)) {
    const parts = rec.message.filter((x): x is string => typeof x === 'string');
    if (parts.length) message = parts.join(' ');
  }

  if (typeof rec.error === 'string' && rec.error.trim()) {
    if (!message) message = rec.error.trim();
  }

  if (rec.error && typeof rec.error === 'object') {
    const errObj = rec.error as Record<string, unknown>;
    if (typeof errObj.message === 'string') message = pickString(errObj.message);
    if (typeof errObj.code === 'string') code = errObj.code;
    if (Array.isArray(errObj.details)) {
      details = errObj.details as ValidationErrorDetail[];
    }
  }

  const detail = pickString(rec.detail);
  const title = pickString(rec.title);
  const msg = pickString(rec.msg);
  const description = pickString(rec.description);
  const reason = pickString(rec.reason);
  const statusMessage = pickString(rec.statusMessage);
  const errorMessage = pickString(rec.errorMessage);
  if (!message) {
    message =
      detail ??
      title ??
      msg ??
      description ??
      reason ??
      statusMessage ??
      errorMessage;
  }

  if (Array.isArray(rec.details)) {
    details = (rec.details as unknown[]).map((item): ValidationErrorDetail | null => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const fieldRaw =
        typeof o.field === 'string'
          ? o.field
          : typeof o.property === 'string'
            ? o.property
            : typeof o.path === 'string'
              ? o.path
              : '';
      let messageRaw = typeof o.message === 'string' ? o.message : '';
      if (!messageRaw && Array.isArray(o.constraints)) {
        const strs = o.constraints.filter((x): x is string => typeof x === 'string');
        if (strs.length) messageRaw = strs.join(', ');
      } else if (!messageRaw && o.constraints && typeof o.constraints === 'object') {
        const c = o.constraints as Record<string, unknown>;
        const first = Object.values(c).find((v): v is string => typeof v === 'string');
        if (first) messageRaw = first;
      }
      const field = fieldRaw.trim();
      const message = messageRaw.trim();
      if (!field && !message) return null;
      return { field: field || 'request', message: message || field };
    }).filter((d): d is ValidationErrorDetail => d !== null);
  }

  if (!message && rec.errors && typeof rec.errors === 'object' && !Array.isArray(rec.errors)) {
    const parts = Object.entries(rec.errors as Record<string, unknown>).flatMap(
      ([field, v]) => {
        if (Array.isArray(v)) {
          return v
            .filter((x): x is string => typeof x === 'string')
            .map((x) => `${field}: ${x}`);
        }
        if (typeof v === 'string' && v.trim()) return [`${field}: ${v.trim()}`];
        return [];
      },
    );
    if (parts.length) message = parts.join(' ');
  }

  if (!message && details?.length) {
    message = joinValidationDetails(details);
  }

  if (isGenericTopLevelMessage(message)) {
    const deep = extractDeepMessage(rec);
    if (deep) message = deep;
  }

  let finalMessage = (message?.trim() || statusFallbackMessage(status)).trim();

  /** Nest/class-validator often sends message "Validation failed" plus a `details` array — prefer field messages. */
  if (details?.length) {
    const fromDetails = joinValidationDetails(details);
    if (!fromDetails) {
      /* keep finalMessage */
    } else if (code === 'VALIDATION_ERROR') {
      /** Avoid duplicating the same lines when API sets message to one constraint and details lists all. */
      finalMessage = fromDetails;
    } else if (
      isGenericTopLevelMessage(finalMessage) ||
      /^validation failed\.?$/i.test(finalMessage) ||
      finalMessage === statusFallbackMessage(422)
    ) {
      finalMessage = fromDetails;
    } else if (!finalMessage.includes(fromDetails.slice(0, 12))) {
      finalMessage = `${finalMessage} — ${fromDetails}`;
    }
  }

  if (code === 'ORG_NOT_AVAILABLE') {
    finalMessage =
      'Your organisation is no longer available. It may have been removed. Contact your administrator or platform support.';
  }

  // Nest/Express often return only the word "Forbidden" / "Unauthorized" — expand so the UI is actionable.
  if (
    status === 403 &&
    /^(forbidden|access denied|access is denied)\.?$/i.test(finalMessage)
  ) {
    finalMessage = statusFallbackMessage(403);
  }
  if (status === 401 && /^unauthorized\.?$/i.test(finalMessage)) {
    finalMessage = statusFallbackMessage(401);
  }

  const requestId =
    pickString(rec.requestId) ??
    pickString(rec.requestID) ??
    pickString(rec.request_id) ??
    pickString((rec.meta as Record<string, unknown> | undefined)?.requestId);
  if (requestId && !finalMessage.includes(requestId)) {
    finalMessage = `${finalMessage}\n\nRequest ID: ${requestId}`;
  }

  return {
    message: finalMessage,
    code,
    details: details?.length ? details : undefined,
  };
}

export class AppApiError extends Error {
  readonly status: number;

  readonly code?: string;

  readonly details?: ValidationErrorDetail[];

  constructor(
    status: number,
    message: string,
    code?: string,
    details?: ValidationErrorDetail[],
  ) {
    super(message);
    this.name = 'AppApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isApiError(e: unknown): e is AppApiError {
  return e instanceof AppApiError;
}
