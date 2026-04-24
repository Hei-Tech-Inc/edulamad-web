import { Button as BaseButton } from '@base-ui/react/button';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
type Size = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-brand text-white hover:bg-brand-hover',
  outline:
    'border border-white/10 bg-transparent text-text-primary hover:bg-bg-raised',
  secondary:
    'bg-bg-surface text-text-primary border border-white/10 hover:bg-bg-raised',
  destructive:
    'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-raised',
  link: 'text-brand underline-offset-4 hover:underline',
};

const sizeClasses: Record<Size, string> = {
  default: 'h-9 px-3.5 text-sm',
  xs: 'h-6 px-2 text-xs',
  sm: 'h-7 px-3 text-xs',
  lg: 'h-10 px-4 text-sm',
  icon: 'h-9 w-9',
  'icon-xs': 'h-6 w-6',
  'icon-sm': 'h-7 w-7',
  'icon-lg': 'h-10 w-10',
};

export function Button({
  variant = 'default',
  size = 'default',
  className,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      data-slot="button"
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

