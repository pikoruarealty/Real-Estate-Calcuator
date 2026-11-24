'use client';

import { useId, type ReactNode } from 'react';
import { Tooltip } from './Tooltip';

export function Select({
  label, value, onChange, children, tip, className = '', hideLabel = false, hint,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  children: ReactNode;
  tip?: string;
  className?: string;
  hideLabel?: boolean;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <div className={hideLabel ? 'sr-only' : 'mb-1.5 flex min-h-6 items-center text-[13px] font-medium text-text-muted'}>
        <label htmlFor={id}>{label}</label>
        {tip && !hideLabel && <Tooltip term={tip} />}
      </div>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-text hover:border-gold-muted"
      >
        {children}
      </select>
      {hint && <p className="mt-1 text-xs leading-relaxed text-text-muted">{hint}</p>}
    </div>
  );
}
