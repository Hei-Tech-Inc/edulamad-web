'use client';

import { useEffect, type ReactNode } from 'react';

export function EditDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'md',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: 'sm' | 'md' | 'lg';
}) {
  const widths = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
  } as const;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`fixed top-0 right-0 bottom-0 z-50 flex w-full ${widths[width]} animate-slide-in-right flex-col overflow-hidden border-l border-white/[0.08] bg-bg-base`}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-white/[0.06] px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-text-primary">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p> : null}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-text-muted transition-colors hover:bg-bg-raised hover:text-text-primary"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </>
  );
}
