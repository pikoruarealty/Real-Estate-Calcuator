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
      <div className={hideLabel ? 'sr-only' : 'mb-2 flex min-h-5 items-center text-[13px] text-text-muted'}>
        <label htmlFor={id}>{label}</label>
        {tip && !hideLabel && <Tooltip term={tip} />}
      </div>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full appearance-none rounded-2xl bg-surface-2 pl-4 pr-10 text-base text-text ring-1 ring-transparent transition hover:ring-white/10 focus:outline-none focus-visible:ring-gold/70 sm:text-[15px]"
        >
          {children}
        </select>
        <svg aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {hint && <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">{hint}</p>}
    </div>
  );
}
