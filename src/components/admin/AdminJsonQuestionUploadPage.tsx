'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Check, FileUp, Loader2 } from 'lucide-react';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { AppApiError } from '@/lib/api-error';
import { parseJSON, validateQuestions } from '@/lib/validate-questions';
import {
  QUESTION_UPLOAD_TEMPLATE_FILE,
  QUESTION_UPLOAD_TEMPLATE_JSON,
} from '@/lib/question-upload-template';
import { sessionHasAdminTools } from '@/lib/session-admin-access';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type {
  UploadQuestion,
  UploadResult,
  ValidationError,
} from '@/types/question-upload.types';

type UploadStep = 'input' | 'preview' | 'uploading' | 'done';

function parseUploadResult(data: unknown): UploadResult {
  if (!data || typeof data !== 'object') {
    return { total: 0, created: 0, skipped: 0, failed: 0, errors: [] };
  }
  const d = data as Record<string, unknown>;
  const num = (v: unknown) =>
    typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0;
  const errorsRaw = d.errors;
  const errors: UploadResult['errors'] = [];
  if (Array.isArray(errorsRaw)) {
    for (const e of errorsRaw) {
      if (!e || typeof e !== 'object') continue;
      const o = e as Record<string, unknown>;
      errors.push({
        questionNumber: num(o.questionNumber),
        courseCode: typeof o.courseCode === 'string' ? o.courseCode : '',
        error: typeof o.error === 'string' ? o.error : 'Unknown error',
      });
    }
  }
  return {
    total: num(d.total),
    created: num(d.created),
    skipped: num(d.skipped),
    failed: num(d.failed),
    errors,
  };
}

function TypeBadge({ type }: { type: string }) {
  const color =
    type === 'mcq'
      ? 'bg-blue-500/20 text-blue-200 border-blue-500/30'
      : type === 'essay'
        ? 'bg-orange-500/20 text-orange-200 border-orange-500/30'
        : type === 'calculation'
          ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
          : 'bg-white/10 text-slate-200 border-white/15';
  return (
    <span
      className={cn(
        'inline-flex rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        color,
      )}
    >
      {type}
    </span>
  );
}

function StepIndicator({ current }: { current: UploadStep }) {
  const steps: { id: UploadStep; label: string }[] = [
    { id: 'input', label: 'Paste JSON' },
    { id: 'preview', label: 'Review' },
    { id: 'uploading', label: 'Uploading' },
    { id: 'done', label: 'Done' },
  ];
  const order: UploadStep[] = [
    'input',
    'preview',
    'uploading',
    'done',
  ];
  const currentIdx = order.indexOf(current);

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
      {steps.map((s, i) => {
        const idx = order.indexOf(s.id);
        const done = currentIdx > idx;
        const active = current === s.id;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-mono font-bold',
                done
                  ? 'bg-emerald-600 text-white'
                  : active
                    ? 'bg-orange-500 text-white'
                    : 'border border-white/15 bg-bg-surface text-text-secondary',
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                'whitespace-nowrap font-semibold',
                active
                  ? 'text-slate-100'
                  : 'text-slate-400',
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 ? (
              <div
                className={cn(
                  'h-px w-6 shrink-0',
                  done ? 'bg-emerald-600/60' : 'bg-white/10',
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

const PANEL_SECTION_LABEL =
  'mb-2 text-xs font-bold uppercase tracking-wide text-slate-300';

function QuestionDetailPanel({ question: q }: { question: UploadQuestion }) {
  return (
    <Card className="max-h-[500px] space-y-4 overflow-y-auto p-4 sm:p-5">
      <div className="flex flex-wrap gap-2">
        <TypeBadge type={q.type} />
        <span className="inline-flex rounded border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-100">
          {q.courseCode}
        </span>
        <span className="inline-flex rounded border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-100">
          {q.university}
        </span>
        {q.difficulty ? (
          <span className="inline-flex rounded border border-amber-400/40 bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-100">
            {q.difficulty}
          </span>
        ) : null}
        {q.marks != null ? (
          <span className="inline-flex rounded border border-white/20 px-2.5 py-1 text-xs font-medium text-slate-200">
            {q.marks} marks
          </span>
        ) : null}
      </div>
      <p className="text-sm font-medium text-slate-300">
        {q.examSession} · Q{q.questionNumber}
        {q.subPart ? `.${q.subPart}` : ''}
        {q.sectionLabel ? ` · ${q.sectionLabel}` : ''}
      </p>
      {q.topic ? (
        <p className="text-sm font-medium text-orange-200">Topic: {q.topic}</p>
      ) : null}
      <div>
        <p className={PANEL_SECTION_LABEL}>Question</p>
        <p className="text-base font-normal leading-relaxed text-slate-100 antialiased">
          {q.questionText}
        </p>
      </div>
      {q.options && q.options.length > 0 ? (
        <div>
          <p className={PANEL_SECTION_LABEL}>Options</p>
          <div className="flex flex-col gap-2">
            {q.options.map((opt) => {
              const ca = q.solution?.correctAnswer;
              const isCorrect =
                ca &&
                (opt === ca ||
                  opt.startsWith(`${ca}.`) ||
                  opt.startsWith(`${ca} `));
              return (
                <div
                  key={opt}
                  className={cn(
                    'rounded-lg border px-3 py-2.5 text-sm font-medium leading-snug',
                    isCorrect
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100'
                      : 'border-white/15 bg-slate-900/60 text-slate-200',
                  )}
                >
                  {opt}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      {q.solution ? (
        <div>
          <p className={PANEL_SECTION_LABEL}>Solution</p>
          {q.solution.correctAnswer ? (
            <p className="text-base font-semibold text-emerald-200">
              Answer: {q.solution.correctAnswer}
            </p>
          ) : null}
          {q.solution.modelAnswer ? (
            <p className="text-sm font-normal leading-relaxed text-slate-200">
              {q.solution.modelAnswer}
            </p>
          ) : null}
          {q.solution.explanation ? (
            <p className="mt-2 text-sm font-normal leading-relaxed text-slate-200">
              {q.solution.explanation}
            </p>
          ) : null}
          {q.solution.keyPoints && q.solution.keyPoints.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2">
              {q.solution.keyPoints.map((kp) => (
                <li
                  key={kp}
                  className="flex items-start gap-2 text-sm font-normal text-slate-200"
                >
                  <span className="mt-0.5 shrink-0 text-orange-400" aria-hidden>
                    •
                  </span>
                  {kp}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

export function AdminJsonQuestionUploadPage() {
  const router = useRouter();
  const sessionUser = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const canAccess = sessionHasAdminTools(sessionUser, accessToken);

  useEffect(() => {
    if (!hasHydrated) return;
    if (sessionUser && !canAccess) {
      void router.replace('/dashboard');
    }
  }, [hasHydrated, sessionUser, canAccess, router]);

  const [step, setStep] = useState<UploadStep>('input');
  const [rawJson, setRawJson] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validQ, setValidQ] = useState<UploadQuestion[]>([]);
  const [valErrors, setValErrors] = useState<ValidationError[]>([]);
  const [valWarnings, setValWarnings] = useState<ValidationError[]>([]);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runParse = useCallback((raw: string) => {
    const { data, error } = parseJSON(raw);
    if (error) {
      setParseError(error);
      return;
    }
    setParseError(null);
    setSubmitError(null);
    const { valid, errors, warnings } = validateQuestions(data!);
    setValidQ(valid);
    setValErrors(errors);
    setValWarnings(warnings);
    setStep('preview');
    setSelectedIdx(valid.length ? 0 : null);
  }, []);

  const handleParse = useCallback(() => {
    if (!rawJson.trim()) return;
    runParse(rawJson);
  }, [rawJson, runParse]);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith('.json')) {
        setParseError('Please upload a .json file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') return;
        setRawJson(text);
        runParse(text);
      };
      reader.readAsText(file);
    },
    [runParse],
  );

  const downloadTemplate = useCallback(() => {
    const blob = new Blob([QUESTION_UPLOAD_TEMPLATE_JSON], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = QUESTION_UPLOAD_TEMPLATE_FILE;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleSubmit = async () => {
    if (!validQ.length) return;
    setUploading(true);
    setSubmitError(null);
    setStep('uploading');
    try {
      const { data } = await apiClient.post<unknown>(
        API.content.questionsBulkJsonUpload,
        { questions: validQ },
      );
      setResult(parseUploadResult(data));
      setStep('done');
    } catch (e) {
      setSubmitError(
        e instanceof AppApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Upload failed. If the API does not implement this route yet, only local validation is available.',
      );
      setStep('preview');
    } finally {
      setUploading(false);
    }
  };

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-300">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-sm font-medium">Loading…</p>
      </div>
    );
  }

  if (!canAccess) {
    return null;
  }

  const lineCount = rawJson ? rawJson.split('\n').length : 0;

  return (
    <div className="space-y-6 text-slate-100 antialiased [text-rendering:optimizeLegibility]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-200 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <StepIndicator current={step} />
      </div>

      {step === 'input' && (
        <div className="flex flex-col gap-4">
          <Card className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <FileUp className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" />
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-slate-100">
                  JSON array of questions
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                  Each item must include courseCode, university, year,
                  examSession, questionNumber, questionText, and type. Paste
                  below or drop a <code className="rounded bg-white/10 px-1 font-mono text-slate-100">.json</code> file.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0"
                onClick={downloadTemplate}
              >
                ↓ Template
              </Button>
            </div>
          </Card>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            className={cn(
              'overflow-hidden rounded-xl border transition-colors',
              isDragging
                ? 'border-orange-500/50 bg-orange-500/5'
                : 'border-white/10 bg-bg-surface',
            )}
          >
            {isDragging ? (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                <FileUp className="h-10 w-10 text-orange-400" aria-hidden />
                <p className="text-base font-semibold text-orange-200">Drop your .json file</p>
                <p className="text-sm text-slate-400">Release to load into the editor</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span className="font-mono font-medium text-slate-300">JSON</span>
                    {lineCount > 0 ? <span>{lineCount} lines</span> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-sm font-medium text-slate-400 hover:text-rose-300"
                      onClick={() => setRawJson('')}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      className="text-sm font-semibold text-orange-300 hover:text-orange-200"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Open file
                    </button>
                  </div>
                </div>
                <textarea
                  value={rawJson}
                  onChange={(e) => setRawJson(e.target.value)}
                  placeholder={'Paste a JSON array of questions, or drop a .json file…'}
                  rows={16}
                  spellCheck={false}
                  className="w-full resize-y bg-transparent p-4 font-mono text-sm font-normal leading-relaxed text-slate-100 antialiased placeholder:text-slate-500 focus:outline-none"
                />
                {rawJson ? (
                  <div className="border-t border-white/10 px-4 py-2 font-mono text-sm text-slate-400">
                    {rawJson.length.toLocaleString()} characters
                  </div>
                ) : null}
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
          {parseError ? (
            <div
              className="rounded-lg border-2 border-rose-500/50 bg-rose-950/80 p-4 text-rose-50 shadow-sm"
              role="alert"
            >
              <p className="text-base font-bold">JSON error</p>
              <p className="mt-2 break-words font-mono text-sm font-normal leading-relaxed text-rose-100">
                {parseError}
              </p>
            </div>
          ) : null}
          <Button
            type="button"
            className="w-full sm:w-auto"
            size="lg"
            disabled={!rawJson.trim()}
            onClick={handleParse}
          >
            Validate and preview →
          </Button>
        </div>
      )}

      {step === 'preview' && (
        <div className="flex flex-col gap-4">
          {submitError ? (
            <div
              className="rounded-lg border-2 border-rose-500/50 bg-rose-950/80 p-4 text-rose-50 shadow-sm"
              role="alert"
            >
              <p className="text-base font-bold">Upload failed</p>
              <p className="mt-2 break-words font-mono text-sm font-normal leading-relaxed text-rose-100">
                {submitError}
              </p>
            </div>
          ) : null}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Card className="p-3 text-center sm:p-4">
              <p className="text-3xl font-mono font-bold tabular-nums text-emerald-300">
                {validQ.length}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-200">Valid</p>
            </Card>
            <Card className="p-3 text-center sm:p-4">
              <p
                className={cn(
                  'text-3xl font-mono font-bold tabular-nums',
                  valErrors.length ? 'text-rose-300' : 'text-slate-500',
                )}
              >
                {valErrors.length}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-200">Errors</p>
            </Card>
            <Card className="p-3 text-center sm:p-4">
              <p
                className={cn(
                  'text-3xl font-mono font-bold tabular-nums',
                  valWarnings.length ? 'text-amber-300' : 'text-slate-500',
                )}
              >
                {valWarnings.length}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-200">Warnings</p>
            </Card>
          </div>

          {valErrors.length > 0 ? (
            <div className="max-h-40 overflow-y-auto rounded-lg border border-rose-500/40 bg-rose-950/50 p-4 text-rose-100">
              <p className="text-sm font-bold text-rose-50">
                {valErrors.length} error(s) — invalid rows are skipped
              </p>
              <ul className="mt-2 space-y-1.5 text-sm font-mono leading-relaxed text-rose-100">
                {valErrors.map((e) => (
                  <li key={`${e.index}-${e.field}-${e.message}`}>
                    Q{e.index + 1} · {e.field}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {valWarnings.length > 0 ? (
            <div className="max-h-32 overflow-y-auto rounded-lg border border-amber-500/40 bg-amber-950/40 p-4 text-amber-100">
              <p className="text-sm font-bold text-amber-50">
                {valWarnings.length} warning(s) — you can still upload
              </p>
              <ul className="mt-2 space-y-1.5 text-sm font-mono leading-relaxed text-amber-100">
                {valWarnings.map((w) => (
                  <li key={`${w.index}-${w.field}`}>
                    Q{w.index + 1} · {w.field}: {w.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="max-h-[min(60vh,520px)] space-y-2 overflow-y-auto pr-1">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-300">
                {validQ.length} valid question(s)
              </p>
              {validQ.map((q, i) => (
                <button
                  key={`${q.courseCode}-${q.questionNumber}-${i}`}
                  type="button"
                  onClick={() =>
                    setSelectedIdx((prev) => (prev === i ? null : i))
                  }
                  className={cn(
                    'w-full rounded-lg border px-3 py-3 text-left transition-colors',
                    selectedIdx === i
                      ? 'border-orange-500/50 bg-orange-500/15 shadow-sm'
                      : 'border-white/10 bg-bg-surface hover:border-white/25',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 shrink-0 text-center font-mono text-sm font-bold text-slate-400">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-100">
                        {q.courseCode} · Q{q.questionNumber}
                        {q.subPart ? `.${q.subPart}` : ''} · {q.examSession}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm font-normal text-slate-300">
                        {q.questionText.slice(0, 80)}
                        {q.questionText.length > 80 ? '…' : ''}
                      </p>
                    </div>
                    <TypeBadge type={q.type} />
                  </div>
                </button>
              ))}
            </div>
            {selectedIdx !== null && validQ[selectedIdx] ? (
              <QuestionDetailPanel question={validQ[selectedIdx]} />
            ) : (
              <div className="hidden min-h-[200px] items-center justify-center rounded-xl border border-dashed border-white/20 bg-slate-900/40 p-6 text-center text-sm font-medium text-slate-300 lg:flex">
                Select a question to preview
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setStep('input');
                setSubmitError(null);
              }}
            >
              ← Edit JSON
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={!validQ.length || uploading}
              onClick={() => void handleSubmit()}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                `Upload ${validQ.length} question${validQ.length === 1 ? '' : 's'}`
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'uploading' && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          <p className="text-lg font-medium text-slate-100">Uploading {validQ.length}…</p>
        </div>
      )}

      {step === 'done' && result && (
        <div className="flex flex-col items-center gap-6 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-3xl">
            ✓
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">
              Upload complete
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Summary from the server response (if the endpoint is available).
            </p>
          </div>
          <div className="grid w-full max-w-md grid-cols-3 gap-2">
            <Card className="p-3 sm:p-4">
              <p className="text-2xl font-mono font-bold tabular-nums text-emerald-300">
                {result.created}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-200">Created</p>
            </Card>
            <Card className="p-3 sm:p-4">
              <p className="text-2xl font-mono font-bold tabular-nums text-amber-300">
                {result.skipped}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-200">Skipped</p>
            </Card>
            <Card className="p-3 sm:p-4">
              <p className="text-2xl font-mono font-bold tabular-nums text-rose-300">
                {result.failed}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-200">Failed</p>
            </Card>
          </div>
          {result.errors.length > 0 ? (
            <div className="w-full max-w-lg rounded-lg border border-rose-500/40 bg-rose-950/50 p-4 text-left text-rose-100">
              {result.errors.map((e) => (
                <p
                  key={`${e.courseCode}-${e.questionNumber}`}
                  className="text-sm font-mono leading-relaxed"
                >
                  {e.courseCode} Q{e.questionNumber}: {e.error}
                </p>
              ))}
            </div>
          ) : null}
          <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setStep('input');
                setRawJson('');
                setValidQ([]);
                setValErrors([]);
                setValWarnings([]);
                setResult(null);
                setParseError(null);
                setSubmitError(null);
              }}
            >
              Upload more
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => {
                void router.push(
                  '/dashboard?admin=catalog#admin-upload-queue',
                );
              }}
            >
              Open admin queue
            </Button>
          </div>
        </div>
      )}

      <Card className="p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-200">
          TypeScript shape (summary)
        </p>
        <pre
          className="mt-3 max-h-56 overflow-auto rounded-lg border border-white/10 bg-slate-950/90 p-4 text-xs font-mono font-normal leading-relaxed text-slate-100 subpixel-antialiased sm:text-sm"
          tabIndex={0}
        >
{`export interface UploadQuestion {
  courseCode, university, year, examSession,
  questionNumber, questionText,
  type: 'mcq' | 'essay' | 'calculation' | 'short_answer' | 'true_false',
  // optional: subPart, options, sectionLabel, marks, topic, difficulty, solution
}`}
        </pre>
      </Card>
    </div>
  );
}
