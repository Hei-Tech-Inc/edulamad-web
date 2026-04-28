'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'orange' | 'green' | 'blue' | 'amber' | 'red';

export interface EntityBannerProps {
  name: string;
  subtitle?: string;
  logoUrl?: string;
  acronym?: string;
  color?: string;
  isActive?: boolean;
  badges?: Array<{ label: string; variant: BadgeVariant }>;
  stats?: Array<{ label: string; value: string | number; icon?: string }>;
  onEdit?: () => void;
  onDeactivate?: () => void;
  onDelete?: () => void;
  extraActions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href: string }>;
}

const badgeClasses: Record<BadgeVariant, string> = {
  default: 'border-slate-300 bg-slate-100 text-slate-700',
  orange: 'border-orange-200 bg-orange-50 text-orange-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-rose-200 bg-rose-50 text-rose-700',
};

function Badge({
  variant,
  children,
}: {
  variant: BadgeVariant;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        badgeClasses[variant],
      )}
    >
      {children}
    </span>
  );
}

export function EntityBanner({
  name,
  subtitle,
  logoUrl,
  acronym,
  color,
  isActive,
  badges,
  stats,
  onEdit,
  onDeactivate,
  onDelete,
  extraActions,
  breadcrumbs,
}: EntityBannerProps) {
  const initials =
    acronym ??
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  const bgColor = color ?? '#F97316';

  return (
    <div className="flex flex-col gap-4">
      {breadcrumbs?.length ? (
        <nav className="flex items-center gap-1.5 text-xs text-slate-300/80">
          {breadcrumbs.map((crumb, i) => (
            <span key={`${crumb.href}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <span>›</span>}
              <Link href={crumb.href} className="transition-colors hover:text-white">
                {crumb.label}
              </Link>
            </span>
          ))}
          <span>›</span>
          <span className="text-white">{name}</span>
        </nav>
      ) : null}

      <Card className="overflow-hidden border-white/15 bg-white/95 p-0 shadow-xl shadow-blue-950/20">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500/70 via-cyan-400/70 to-indigo-500/70" />

        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
          <div className="shrink-0">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={name}
                className="h-16 w-16 rounded-xl border border-white/10 bg-white p-1 object-contain"
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-xl text-xl font-display font-bold text-white"
                style={{ backgroundColor: bgColor }}
              >
                {initials || 'E'}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start gap-2">
              <h1 className="text-xl font-display font-bold text-text-primary">{name}</h1>
              {isActive === false && <Badge variant="red">Inactive</Badge>}
              {badges?.map((b, i) => (
                <Badge key={`${b.label}-${i}`} variant={b.variant}>
                  {b.label}
                </Badge>
              ))}
            </div>
            {subtitle ? <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p> : null}

            {stats?.length ? (
              <div className="mt-3 flex flex-wrap items-center gap-5">
                {stats.slice(0, 6).map((s, i) => (
                  <div key={`${s.label}-${i}`} className="flex min-w-[70px] flex-col gap-0.5">
                    <p className="font-mono text-lg font-bold leading-none tabular-nums text-text-primary">
                      {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                    </p>
                <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {extraActions}
            {onEdit ? (
              <Button variant="secondary" size="sm" onClick={onEdit}>
                Edit
              </Button>
            ) : null}
            {onDeactivate ? (
              <Button variant="ghost" size="sm" onClick={onDeactivate}>
                {isActive === false ? 'Activate' : 'Deactivate'}
              </Button>
            ) : null}
            {onDelete ? (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                Delete
              </Button>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
