import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <article
      className={cn('rounded-2xl border border-line bg-white p-4 shadow-sm', className)}
      {...props}
    />
  );
}
