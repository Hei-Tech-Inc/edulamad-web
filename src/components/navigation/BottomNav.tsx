'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', icon: '⊞', label: 'Home' },
  { href: '/courses', icon: '📚', label: 'Courses' },
  { href: '/quiz/new', icon: '⚡', label: 'Practice' },
  { href: '/flashcards', icon: '🃏', label: 'Flashcards' },
  { href: '/profile', icon: '👤', label: 'Profile' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-bg-base/95 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex min-h-[56px] min-w-[56px] flex-col items-center justify-center gap-0.5 px-3 py-2 transition-all duration-150 active:scale-90',
              )}
            >
              <span
                className={cn(
                  'text-xl transition-all duration-150',
                  active
                    ? 'filter drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]'
                    : 'opacity-40',
                )}
              >
                {item.icon}
              </span>
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  active ? 'text-brand' : 'text-text-muted',
                )}
              >
                {item.label}
              </span>
              {active && (
                <span className="absolute -bottom-px h-0.5 w-6 rounded-full bg-brand" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

