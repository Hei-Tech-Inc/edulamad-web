'use client';

import { Button } from '@/components/ui/button';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  variant = 'danger',
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-float">
          <h3 className="mb-2 text-base font-semibold text-slate-900">{title}</h3>
          <p className="mb-5 text-sm leading-relaxed text-slate-600">{message}</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant={variant === 'danger' ? 'destructive' : 'secondary'}
              className="flex-1"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Please wait…' : confirmLabel ?? 'Confirm'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
