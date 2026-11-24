'use client';

import { useId } from 'react';
import { Tooltip } from './Tooltip';

/** Segmented control (radio group). */
export function Segmented<T extends string | number>({
  label, value, options, onChange, tip, size = 'md', hint,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; short?: string; tip?: string }[];
  onChange: (v: T) => void;
  tip?: string;
  size?: 'sm' | 'md';
  hint?: string;
}) {
  const id = useId();
  return (
    <div role="radiogroup" aria-labelledby={id}>
      <div className="mb-2 flex min-h-5 items-center text-[13px] text-text-muted">
        <span id={id}>{label}</span>
        {tip && <Tooltip term={tip} />}
      </div>
      <div className="flex w-full gap-1 rounded-full bg-surface-2 p-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`min-h-10 min-w-0 flex-1 whitespace-nowrap rounded-full px-2 leading-tight transition ${size === 'sm' ? 'text-[13px]' : 'text-sm'} ${
                active ? 'bg-gold font-semibold text-black shadow-sm' : 'text-text-muted hover:text-text'
              }`}
            >
              {o.short ? (
                <>
                  <span aria-hidden className="sm:hidden">{o.short}</span>
                  <span className="sr-only sm:not-sr-only">{o.label}</span>
                </>
              ) : o.label}
            </button>
          );
        })}
      </div>
      {hint && <p className="mt-2 text-[13px] leading-relaxed text-text-muted">{hint}</p>}
    </div>
  );
}

/** On/off switch with label. */
export function Switch({ label, checked, onChange, hint, tip }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string; tip?: string }) {
  const id = useId();
  return (
    <div className="flex items-start">
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-text">
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      {/* Track + knob are styled from `checked` directly (no peer/child selector tricks). */}
      <span
        aria-hidden
        className={`relative mt-px inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold ${
          checked ? 'border-gold/60 bg-gold/25' : 'border-white/10 bg-surface-2'
        }`}
      >
        <span
          className={`absolute left-0.5 h-[18px] w-[18px] rounded-full shadow transition-transform duration-150 ${
            checked ? 'translate-x-5 bg-gold' : 'translate-x-0 bg-text-muted'
          }`}
        />
      </span>
      <span className="pt-0.5">
        {label}
        <span className={`ml-2 text-xs font-medium ${checked ? 'text-gold' : 'text-text-muted'}`}>{checked ? 'Yes' : 'No'}</span>
        {hint && <span className="mt-0.5 block text-[13px] text-text-muted">{hint}</span>}
      </span>
    </label>
    {tip && <Tooltip term={tip} className="mt-[-1px]" />}
    </div>
  );
}
