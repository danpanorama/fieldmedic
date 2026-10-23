import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'success' | 'info' | 'warning' | 'danger';

const tones: Record<Tone, string> = {
  success: 'bg-brand-50 text-brand-700',
  info: 'bg-sky-50 text-sky-900',
  warning: 'bg-amber-50 text-amber-900',
  danger: 'bg-red-50 text-red-900',
};

/** A colored message box. role="status" lets screen readers announce it. */
export function Notice({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <p role="status" className={cn('rounded-xl px-4 py-3 text-sm leading-relaxed', tones[tone])}>
      {children}
    </p>
  );
}
