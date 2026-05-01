'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { AppApiError } from '@/lib/api-error';

export interface UniversityFormValues {
  name: string;
  acronym: string;
  location: string;
  type: 'public' | 'private';
  websiteUrl: string;
  /** Logo storage key if your API uses uploaded keys */
  logoKey: string;
  isActive: boolean;
}

export function UniversityForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: Partial<UniversityFormValues>;
  onSubmit: (values: UniversityFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const [form, setForm] = useState<UniversityFormValues>({
    name: initial?.name ?? '',
    acronym: initial?.acronym ?? '',
    location: initial?.location ?? '',
    type: initial?.type ?? 'public',
    websiteUrl: initial?.websiteUrl ?? '',
    logoKey: initial?.logoKey ?? '',
    isActive: initial?.isActive ?? true,
  });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const inputClassName =
    'mt-1 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400';

  const save = async () => {
    setError('');
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.acronym.trim()) {
      setError('Acronym is required');
      return;
    }
    if (!form.location.trim()) {
      setError('Location is required');
      return;
    }
    setPending(true);
    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
        acronym: form.acronym.trim().toUpperCase(),
        location: form.location.trim(),
        websiteUrl: form.websiteUrl.trim(),
        logoKey: form.logoKey.trim(),
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
          Full name
          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-rose-700 uppercase">
            Required
          </span>
        </span>
        <Input
          className={inputClassName}
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          placeholder="e.g. Kwame Nkrumah University of Science and Technology"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-slate-700">
          <span className="flex items-center gap-2">
            Acronym
            <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-rose-700 uppercase">
              Required
            </span>
          </span>
          <Input
            className={`${inputClassName} font-mono`}
            value={form.acronym}
            onChange={(e) =>
              setForm((s) => ({ ...s, acronym: e.target.value.toUpperCase() }))
            }
            placeholder="e.g. KNUST"
          />
        </label>
        <label className="text-sm text-slate-700">
          <span className="flex items-center gap-2">
            Location
            <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-rose-700 uppercase">
              Required
            </span>
          </span>
          <Input
            className={inputClassName}
            value={form.location}
            onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
            placeholder="e.g. Kumasi"
          />
        </label>
      </div>
      <div>
        <p className="mb-2 flex items-center gap-2 text-sm text-slate-700">
          Type
          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-rose-700 uppercase">
            Required
          </span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(['public', 'private'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((s) => ({ ...s, type: t }))}
              className={`rounded-lg border py-3 text-sm font-medium capitalize transition-colors ${
                form.type === t
                  ? 'border-brand/50 bg-brand/15 text-brand'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <label className="text-sm text-slate-700">
        <span className="flex items-center gap-2">
          Website URL
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-600 uppercase">
            Optional
          </span>
        </span>
        <Input
          className={inputClassName}
          value={form.websiteUrl}
          onChange={(e) => setForm((s) => ({ ...s, websiteUrl: e.target.value }))}
          placeholder="e.g. https://www.knust.edu.gh"
        />
      </label>
      <label className="text-sm text-slate-700">
        <span className="flex items-center gap-2">
          Logo key
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-600 uppercase">
            Optional
          </span>
        </span>
        <Input
          className={`${inputClassName} font-mono text-xs`}
          value={form.logoKey}
          onChange={(e) => setForm((s) => ({ ...s, logoKey: e.target.value }))}
          placeholder="e.g. files/universities/knust/logo.png"
        />
      </label>
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3">
        <div>
          <p className="text-sm font-medium text-slate-900">Active</p>
          <p className="text-xs text-slate-500">Inactive hides this university from pickers</p>
        </div>
        <Toggle checked={form.isActive} onChange={(v) => setForm((s) => ({ ...s, isActive: v }))} />
      </div>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="button" disabled={pending} onClick={() => void save()}>
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </div>
  );
}
