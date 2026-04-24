import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from '@/lib/utils';

export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-9 w-full min-w-0 rounded-md border border-white/10 bg-bg-surface px-3 py-1 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}

