import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'success' | 'danger';

const tones: Record<Tone, string> = {
  success: 'bg-brand-50 text-brand-700',
  danger: 'bg-red-100 text-red-800',
};

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={cn('inline-flex rounded-full px-3 py-1 text-sm font-medium', tones[tone])}>
      {children}
    </span>
  );
}
