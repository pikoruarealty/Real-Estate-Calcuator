'use client';

import { useId } from 'react';
import { Tooltip } from './Tooltip';

/** Segmented control (radio group). */
export function Segmented<T extends string | number>({
  label, value, options, onChange, tip, size = 'md', hint,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; tip?: string }[];
  onChange: (v: T) => void;
  tip?: string;
  size?: 'sm' | 'md';
  hint?: string;
}) {
  const id = useId();
  return (
    <div role="radiogroup" aria-labelledby={id}>
      <div className="mb-1.5 flex min-h-6 items-center text-[13px] font-medium text-text-muted">
        <span id={id}>{label}</span>
        {tip && <Tooltip term={tip} />}
      </div>
      <div className="flex w-full overflow-hidden rounded-lg border border-border bg-bg p-0.5">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`flex-1 rounded-md px-2 ${size === 'sm' ? 'py-1.5 text-xs' : 'py-2 text-sm'} transition ${
                active ? 'bg-gold font-semibold text-black' : 'text-text-muted hover:text-text'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{hint}</p>}
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
          checked ? 'border-gold bg-gold/30' : 'border-border bg-bg'
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
        {hint && <span className="block text-xs text-text-muted">{hint}</span>}
      </span>
    </label>
    {tip && <Tooltip term={tip} className="mt-[-1px]" />}
    </div>
  );
}
