import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  isVerified?: boolean;
}

export function Avatar({
  className,
  size = 'md',
  isOnline,
  isVerified,
  children,
  ...props
}: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  return (
    <div className={cn('relative inline-block shrink-0', className)} {...props}>
      <div
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-100 items-center justify-center font-bold text-gray-700',
          sizes[size]
        )}
      >
        {children}
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 block w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
      )}
      {isVerified && (
        <span className="absolute top-0 right-0 block w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-black ring-2 ring-white">
          ✓
        </span>
      )}
    </div>
  );
}

export function AvatarImage({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [hasError, setHasError] = React.useState(false);

  if (!src || hasError) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt || 'Avatar'}
      onError={() => setHasError(true)}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  );
}

export function AvatarFallback({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('flex h-full w-full items-center justify-center rounded-full bg-gray-100 font-bold uppercase text-gray-600', className)}
      {...props}
    >
      {children}
    </span>
  );
}
