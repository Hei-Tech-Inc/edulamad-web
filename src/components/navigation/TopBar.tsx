'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  showActions?: boolean;
  onBack?: () => void;
  rightElement?: ReactNode;
}

export function TopBar({
  title,
  showBack = false,
  showActions = true,
  onBack,
  rightElement,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-bg-base/95 backdrop-blur-xl pt-safe">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-bg-surface text-text-secondary active:bg-bg-raised"
            >
              ←
            </button>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
                E
              </div>
            </Link>
          )}
          {title && (
            <h1 className="text-base font-semibold text-text-primary">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {rightElement}
          <ThemeToggle size="sm" />
          {showActions && (
            <Link
              href="/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-bg-surface text-text-secondary active:bg-bg-raised"
            >
              <span aria-hidden>🔔</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

