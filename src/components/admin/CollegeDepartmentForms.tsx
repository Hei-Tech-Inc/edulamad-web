'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { AppApiError } from '@/lib/api-error';

export function CollegeForm({
  universityId,
  initial,
  onSubmit,
  submitLabel,
}: {
  universityId: string;
  initial?: { id?: string; name?: string; code?: string; isActive?: boolean };
  onSubmit: (payload: {
    name: string;
    code?: string;
    dean?: string;
    universityId: string;
    isActive: boolean;
  }) => Promise<void>;
  submitLabel: string;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
  const [dean, setDean] = useState('');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const inputClassName =
    'mt-1 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400';

  const save = async () => {
    setError('');
    if (!name.trim()) {
      setError('College name is required');
      return;
    }
    setPending(true);
    try {
      await onSubmit({
        name: name.trim(),
        code: code.trim() || undefined,
        dean: dean.trim() || undefined,
        universityId,
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
          College name
          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-rose-700 uppercase">
            Required
          </span>
        </span>
        <Input
          className={inputClassName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. College of Engineering"
        />
      </label>
      <label className="text-sm text-slate-700">
        <span className="flex items-center gap-2">
          Code
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-600 uppercase">
            Optional
          </span>
        </span>
        <Input
          className={`${inputClassName} font-mono`}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. COE"
        />
      </label>
      <label className="text-sm text-slate-700">
        <span className="flex items-center gap-2">
          Dean
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-600 uppercase">
            Optional
          </span>
        </span>
        <Input
          className={inputClassName}
          value={dean}
          onChange={(e) => setDean(e.target.value)}
          placeholder="e.g. Prof. Ama Mensah"
        />
      </label>
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3">
        <div>
          <p className="text-sm font-medium text-slate-900">Active</p>
          <p className="text-xs text-slate-500">Inactive hides this college from active pickers</p>
        </div>
        <Toggle checked={isActive} onChange={setIsActive} />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="button" disabled={pending} onClick={() => void save()}>
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </div>
  );
}

export function DepartmentForm({
  collegeId,
  initial,
  onSubmit,
  submitLabel,
}: {
  collegeId: string;
  initial?: { id?: string; name?: string; code?: string; isActive?: boolean };
  onSubmit: (payload: {
    name: string;
    code?: string;
    collegeId: string;
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
      setError('Department name is required');
      return;
    }
    setPending(true);
    try {
      await onSubmit({
        name: name.trim(),
        code: code.trim() || undefined,
        collegeId,
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
          Department name
          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-rose-700 uppercase">
            Required
          </span>
        </span>
        <Input
          className={inputClassName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Computer Science"
        />
      </label>
      <label className="text-sm text-slate-700">
        <span className="flex items-center gap-2">
          Code
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-600 uppercase">
            Optional
          </span>
        </span>
        <Input
          className={`${inputClassName} font-mono`}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. CS"
        />
      </label>
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3">
        <div>
          <p className="text-sm font-medium text-slate-900">Active</p>
          <p className="text-xs text-slate-500">Inactive hides this department from active pickers</p>
        </div>
        <Toggle checked={isActive} onChange={setIsActive} />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="button" disabled={pending} onClick={() => void save()}>
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </div>
  );
}
