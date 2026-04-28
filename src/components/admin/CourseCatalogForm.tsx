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
      <label className="text-sm text-text-secondary">
        Course title *
        <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="text-sm text-text-secondary">
        Course code (optional)
        <Input
          className="mt-1 font-mono uppercase"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="COSC 201"
        />
      </label>
      <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-bg-surface px-3 py-3">
        <div>
          <p className="text-sm text-text-primary">Active</p>
          <p className="text-xs text-text-muted">Inactive courses stay out of student pickers</p>
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
