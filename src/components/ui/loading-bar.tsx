
'use client';

import { cn } from '@/lib/utils';

export function LoadingBar({ loading }: { loading: boolean }) {
  return (
    <div
      className={cn(
        'fixed top-0 left-0 z-50 h-1 w-full bg-primary/20 transition-opacity duration-300',
        loading ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div
        className={cn(
          'h-full bg-primary transition-all duration-500 ease-in-out',
          loading ? 'w-full' : 'w-0'
        )}
      />
    </div>
  );
}
