function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function pickStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** Nested API shapes e.g. `{ content: { text: "..." } }`. */
function textFromContentField(v: unknown): string {
  const o = asRecord(v);
  if (!o) return '';
  for (const key of ['text', 'body', 'markdown', 'html', 'value', 'plain']) {
    const s = pickStr(o[key]);
    if (s) return s;
  }
  return '';
}

function pickArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  const rec = asRecord(v);
  if (!rec) return [];
  for (const key of ['items', 'data', 'results', 'solutions', 'rows']) {
    const next = rec[key];
    if (Array.isArray(next)) return next;
  }
  for (const wrap of ['data', 'payload', 'result']) {
    const inner = asRecord(rec[wrap]);
    if (!inner) continue;
    for (const key of ['items', 'solutions', 'data', 'results', 'rows']) {
      const next = inner[key];
      if (Array.isArray(next)) return next;
    }
  }
  return [];
}

function coalesceVerified(rec: Record<string, unknown>): boolean {
  if (rec.isVerified === true || rec.verified === true || rec.is_verified === true) return true;
  if (rec.verified === 'true' || rec.isVerified === 'true') return true;
  const st = rec.status ?? rec.solutionStatus;
  if (typeof st === 'string' && st.toLowerCase() === 'verified') return true;
  const src = rec.source ?? rec.origin ?? rec.kind;
  if (typeof src === 'string' && ['official', 'ta', 'teacher', 'verified'].includes(src.toLowerCase()))
    return true;
  return false;
}

export type SolutionRow = {
  text: string;
  isVerified: boolean;
  correctIndex: number | null;
};

function answerStringAsLetter(answer: unknown): string | null {
  if (typeof answer !== 'string') return null;
  const s = answer.trim();
  return /^[A-Za-z]$/.test(s) ? s : null;
}

function answerStringAsProse(answer: unknown): string | null {
  if (typeof answer !== 'string') return null;
  const s = answer.trim();
  if (!s) return null;
  if (/^[A-Za-z]$/.test(s)) return null;
  if (/^\d+$/.test(s)) return null;
  return s;
}

function parseRow(item: unknown): SolutionRow | null {
  if (typeof item === 'string') {
    const t = item.trim();
    return t ? { text: t, isVerified: false, correctIndex: null } : null;
  }
  const rec = asRecord(item);
  if (!rec) return null;

  const isVerified = coalesceVerified(rec);
  let correctIndex: number | null = null;
  const ci =
    rec.correctOptionIndex ??
    rec.correctIndex ??
    rec.answerIndex ??
    rec.optionIndex ??
    rec.selectedIndex ??
    rec.option;
  if (typeof ci === 'number' && Number.isInteger(ci) && ci >= 0) {
    correctIndex = ci;
  } else if (typeof ci === 'string' && /^\d+$/.test(ci)) {
    const n = parseInt(ci, 10);
    if (n >= 0) correctIndex = n;
  }

  if (
    correctIndex === null &&
    typeof rec.answer === 'number' &&
    Number.isInteger(rec.answer) &&
    rec.answer >= 0
  ) {
    correctIndex = rec.answer;
  }

  const letterFromAnswer = answerStringAsLetter(rec.answer);
  const letterRaw =
    rec.correctLetter ?? rec.correctOption ?? rec.choice ?? letterFromAnswer;
  if (correctIndex === null && typeof letterRaw === 'string' && /^[A-Za-z]$/.test(letterRaw)) {
    correctIndex = letterRaw.toUpperCase().charCodeAt(0) - 65;
  }

  let safeIdx = correctIndex !== null && correctIndex >= 0 ? correctIndex : null;

  const prose =
    pickStr(rec.text) ||
    pickStr(rec.solution) ||
    pickStr(rec.solutionText) ||
    pickStr(rec.officialAnswer) ||
    pickStr(rec.answerText) ||
    pickStr(rec.body) ||
    pickStr(rec.explanation) ||
    pickStr(rec.description) ||
    pickStr(rec.notes) ||
    pickStr(rec.rationale) ||
    pickStr(rec.markdown) ||
    pickStr(rec.markingScheme) ||
    pickStr(rec.taNotes) ||
    pickStr(rec.teacherNotes) ||
    textFromContentField(rec.content) ||
    answerStringAsProse(rec.answer) ||
    pickStr(rec.value);

  let text = prose;

  if (safeIdx === null && text) {
    const embedded = text.match(/\*\*correct\s+answer\s*[:：]?\s*([A-Ea-e])\*\*/i);
    const plain = text.match(/correct\s+answer\s*[:：]?\s*([A-Ea-e])\b/i);
    const letter = embedded?.[1] ?? plain?.[1];
    if (letter) {
      const i = letter.toUpperCase().charCodeAt(0) - 65;
      if (i >= 0 && i < 26) safeIdx = i;
    }
  }

  if (!text && safeIdx === null) return null;
  return { text, isVerified, correctIndex: safeIdx };
}

export function normalizeQuestionSolutionsPayload(raw: unknown): SolutionRow[] {
  const out: SolutionRow[] = [];
  for (const item of pickArray(raw)) {
    const row = parseRow(item);
    if (row) out.push(row);
  }
  return out;
}

function firstNonEmptyText(candidates: readonly SolutionRow[]): string | null {
  for (const r of candidates) {
    const t = r.text.trim();
    if (t) return t;
  }
  return null;
}

/** Prefer verified row prose; else any row with text (trimmed). */
export function pickOfficialSolutionText(rows: readonly SolutionRow[]): string | null {
  if (!rows.length) return null;
  const verified = rows.filter((r) => r.isVerified);
  return firstNonEmptyText(verified) ?? firstNonEmptyText(rows);
}

/**
 * Human-readable official line: prose when present, else resolved MCQ option
 * (`"B. Secondary"`) when the API only returns an index / letter.
 */
export function officialAnswerDisplay(
  rows: readonly SolutionRow[],
  options?: readonly string[] | undefined,
): string | null {
  const prose = pickOfficialSolutionText(rows);
  if (prose) return prose;
  if (options?.length) {
    const idx = resolveMcqCorrectIndex(options, rows);
    if (idx !== null && options[idx]) {
      const letter = String.fromCharCode(65 + idx);
      return `${letter}. ${options[idx]}`;
    }
  }
  return null;
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Best-effort: structured index from API, else match solution text to an option. */
export function resolveMcqCorrectIndex(options: readonly string[], rows: readonly SolutionRow[]): number | null {
  if (!options.length || !rows.length) return null;
  const sorted = [...rows].sort((a, b) => {
    if (a.isVerified === b.isVerified) return 0;
    return a.isVerified ? -1 : 1;
  });
  for (const row of sorted) {
    if (
      row.correctIndex != null &&
      row.correctIndex >= 0 &&
      row.correctIndex < options.length
    ) {
      return row.correctIndex;
    }
  }
  const official = pickOfficialSolutionText(rows);
  if (official) {
    const nt = norm(official);
    for (let i = 0; i < options.length; i++) {
      if (norm(options[i]!) === nt) return i;
    }
    for (let i = 0; i < options.length; i++) {
      const o = norm(options[i]!);
      if (nt.includes(o) || o.includes(nt)) return i;
    }
    const lead = official.match(/^\s*([A-Ea-e])\s*[\.)]\s*/);
    if (lead) {
      const i = lead[1]!.toUpperCase().charCodeAt(0) - 65;
      if (i >= 0 && i < options.length) return i;
    }
    let ans = official.match(/correct\s+answer\s*[:：]?\s*\*?\*?\s*([A-Ea-e])\b/i);
    if (ans) {
      const i = ans[1]!.toUpperCase().charCodeAt(0) - 65;
      if (i >= 0 && i < options.length) return i;
    }
    ans = official.match(/\*\*correct\s+answer\s*[:：]?\s*([A-Ea-e])\*\*/i);
    if (ans) {
      const i = ans[1]!.toUpperCase().charCodeAt(0) - 65;
      if (i >= 0 && i < options.length) return i;
    }
    ans = official.match(/answer\s*[:：)]\s*([A-Ea-e])\b/i);
    if (ans) {
      const i = ans[1]!.toUpperCase().charCodeAt(0) - 65;
      if (i >= 0 && i < options.length) return i;
    }
    const ansItalic = official.match(/answer\s*[:：)]\s*\*([^*]+)\*/i);
    if (ansItalic) {
      const word = ansItalic[1]!.trim();
      for (let i = 0; i < options.length; i++) {
        if (norm(options[i]!) === norm(word)) return i;
      }
    }
  }
  return null;
}

/** First-line hint text without prioritizing verified (lighter pre-submit copy when needed). */
export function pickAnySolutionText(rows: readonly SolutionRow[]): string | null {
  return firstNonEmptyText(rows);
}
