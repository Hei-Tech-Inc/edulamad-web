'use client';

import { useState } from 'react';
import { UpgradeModal, type UpgradeTrigger } from '@/components/pricing/UpgradeModal';
import { cn } from '@/lib/utils';

type Props = {
  trigger?: UpgradeTrigger;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  variant?: 'orange' | 'ghost' | 'outline';
};

const sizeClasses = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-6 py-3',
};

const variantClasses = {
  orange: 'bg-orange-500 hover:bg-orange-600 text-white',
  ghost: 'text-orange-600 hover:text-orange-700 dark:text-orange-400 underline-offset-4 hover:underline',
  outline:
    'border border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30',
};

export function UpgradeButton({
  trigger = 'generic',
  size = 'md',
  label,
  variant = 'orange',
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-semibold transition-colors',
          sizeClasses[size],
          variantClasses[variant],
        )}
      >
        {label ?? 'Unlock unlimited questions'}
      </button>
      <UpgradeModal
        isOpen={open}
        onClose={() => setOpen(false)}
        trigger={trigger}
      />
    </>
  );
}
