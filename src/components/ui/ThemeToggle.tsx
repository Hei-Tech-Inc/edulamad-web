'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'sm' | 'md';
  /** Icon-only control for dense chrome (e.g. landing header). */
  iconOnly?: boolean;
}

export function ThemeToggle({ size = 'md', iconOnly = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const iconClass =
    size === 'sm' ? 'h-[18px] w-[18px] shrink-0' : 'h-5 w-5 shrink-0';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={
        iconOnly
          ? `inline-flex items-center justify-center rounded-xl border transition-colors hover:bg-bg-hover/70 ${size === 'sm' ? 'h-10 w-10' : 'h-11 w-11'}`
          : `inline-flex items-center justify-center gap-2 rounded-full border transition-all ${
              size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'
            }`
      }
      style={{
        background: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        borderColor: 'var(--border-default)',
      }}
    >
      {isDark ? (
        <Sun className={iconClass} strokeWidth={2} aria-hidden />
      ) : (
        <Moon className={iconClass} strokeWidth={2} aria-hidden />
      )}
      {!iconOnly ? (
        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
          {isDark ? 'Light' : 'Dark'}
        </span>
      ) : null}
    </button>
  );
}
