import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: 'default' | 'gradient' | 'premium';
}

export function Progress({
  className,
  value = 0,
  max = 100,
  variant = 'default',
  ...props
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variants = {
    default: 'bg-[#e20030]',
    gradient: 'bg-gradient-to-r from-[#e20030] via-rose-500 to-amber-500',
    premium: 'bg-gradient-to-r from-amber-400 to-amber-600',
  };

  return (
    <div
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-gray-100', className)}
      {...props}
    >
      <div
        className={cn('h-full w-full flex-1 transition-all duration-300 ease-out', variants[variant])}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
}
