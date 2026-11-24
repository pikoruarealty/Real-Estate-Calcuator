'use client';

import { useId, type ReactNode } from 'react';
import { Tooltip } from './Tooltip';

export function Select({
  label, value, onChange, children, tip, className = '', hideLabel = false,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  children: ReactNode;
  tip?: string;
  className?: string;
  hideLabel?: boolean;
}) {
  const id = useId();
  return (
    <div className={className}>
      <div className={hideLabel ? 'sr-only' : 'mb-1.5 flex items-center text-xs font-medium text-text-muted'}>
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
    </div>
  );
}
