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
      <label className="text-sm text-text-secondary">
        Full name *
        <Input
          className="mt-1"
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          placeholder="Kwame Nkrumah University of Science and Technology"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-text-secondary">
          Acronym *
          <Input
            className="mt-1 font-mono"
            value={form.acronym}
            onChange={(e) =>
              setForm((s) => ({ ...s, acronym: e.target.value.toUpperCase() }))
            }
            placeholder="KNUST"
          />
        </label>
        <label className="text-sm text-text-secondary">
          Location *
          <Input
            className="mt-1"
            value={form.location}
            onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
            placeholder="Kumasi"
          />
        </label>
      </div>
      <div>
        <p className="mb-2 text-sm text-text-secondary">Type *</p>
        <div className="grid grid-cols-2 gap-2">
          {(['public', 'private'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((s) => ({ ...s, type: t }))}
              className={`rounded-lg border py-3 text-sm font-medium capitalize transition-colors ${
                form.type === t
                  ? 'border-brand/50 bg-brand/15 text-brand'
                  : 'border-white/[0.08] bg-bg-surface text-text-muted hover:border-white/20'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <label className="text-sm text-text-secondary">
        Website URL
        <Input
          className="mt-1"
          value={form.websiteUrl}
          onChange={(e) => setForm((s) => ({ ...s, websiteUrl: e.target.value }))}
          placeholder="https://…"
        />
      </label>
      <label className="text-sm text-text-secondary">
        Logo key (optional)
        <Input
          className="mt-1 font-mono text-xs"
          value={form.logoKey}
          onChange={(e) => setForm((s) => ({ ...s, logoKey: e.target.value }))}
          placeholder="files/…"
        />
      </label>
      <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-bg-surface px-3 py-3">
        <div>
          <p className="text-sm font-medium text-text-primary">Active</p>
          <p className="text-xs text-text-muted">Inactive hides this university from pickers</p>
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
