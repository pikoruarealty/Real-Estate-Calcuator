'use client';

import { useId } from 'react';
import { Tooltip } from './Tooltip';

/** Segmented control (radio group). */
export function Segmented<T extends string | number>({
  label, value, options, onChange, tip, size = 'md',
}: {
  label: string;
  value: T;
  options: { value: T; label: string; tip?: string }[];
  onChange: (v: T) => void;
  tip?: string;
  size?: 'sm' | 'md';
}) {
  const id = useId();
  return (
    <div role="radiogroup" aria-labelledby={id}>
      <div id={id} className="mb-1.5 text-xs font-medium text-text-muted">
        {label}
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
    </div>
  );
}

/** On/off switch with label. */
export function Switch({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-text">
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="mt-0.5 inline-block h-5 w-9 shrink-0 rounded-full border border-border bg-bg p-0.5 transition peer-checked:border-gold peer-checked:bg-gold/30 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-gold [&>span]:peer-checked:translate-x-4 [&>span]:peer-checked:bg-gold">
        <span className="block h-3.5 w-3.5 rounded-full bg-text-muted transition" />
      </span>
      <span>
        {label}
        {hint && <span className="block text-xs text-text-muted">{hint}</span>}
      </span>
    </label>
  );
}
