'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { AppApiError } from '@/lib/api-error';

export function CourseCatalogForm({
  departmentId,
  initial,
  onSubmit,
  submitLabel,
}: {
  departmentId: string;
  initial?: { id?: string; name?: string; code?: string; isActive?: boolean };
  onSubmit: (payload: {
    name: string;
    code?: string;
    departmentId: string;
    isActive: boolean;
  }) => Promise<void>;
  submitLabel: string;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const inputClassName =
    'mt-1 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400';

  const save = async () => {
    setError('');
    if (!name.trim()) {
      setError('Course title is required');
      return;
    }
    setPending(true);
    try {
      await onSubmit({
        name: name.trim(),
        code: code.trim() || undefined,
        departmentId,
        isActive,
      });
    } catch (e) {
      setError(
        e instanceof AppApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Could not save',
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <label className="text-sm text-slate-700">
        <span className="flex items-center gap-2">
          Course title
          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-rose-700 uppercase">
            Required
          </span>
        </span>
        <Input
          className={inputClassName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Data Structures and Algorithms"
        />
      </label>
      <label className="text-sm text-slate-700">
        <span className="flex items-center gap-2">
          Course code
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-600 uppercase">
            Optional
          </span>
        </span>
        <Input
          className={`${inputClassName} font-mono uppercase`}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. COSC 201"
        />
      </label>
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3">
        <div>
          <p className="text-sm font-medium text-slate-900">Active</p>
          <p className="text-xs text-slate-500">Inactive courses stay out of student pickers</p>
        </div>
        <Toggle checked={isActive} onChange={setIsActive} />
      </div>
      {error ? (
        <p className="whitespace-pre-line text-sm text-danger">{error}</p>
      ) : null}
      <Button type="button" disabled={pending} onClick={() => void save()}>
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </div>
  );
}
