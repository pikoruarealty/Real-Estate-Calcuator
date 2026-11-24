'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Tooltip } from './Tooltip';

const fmt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 4 });

function parse(s: string): number | null | 'invalid' {
  const t = s.replace(/[,\s₹]/g, '');
  if (t === '') return null;
  if (!/^-?\d*\.?\d*$/.test(t) || t === '-' || t === '.') return 'invalid';
  const n = Number(t);
  return Number.isFinite(n) ? n : 'invalid';
}

export interface NumberInputProps {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  tip?: string; // glossary key
  prefix?: string;
  suffix?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  className?: string;
  /** treat empty as 0 instead of null (for non-nullable fields) */
  emptyAsZero?: boolean;
  min?: number;
  readOnly?: boolean;
  hideLabel?: boolean;
}

/** Accepts commas, formats en-IN on blur, never emits NaN. */
export function NumberInput({
  label, value, onChange, tip, prefix, suffix, error, hint, placeholder, className = '',
  emptyAsZero, min, readOnly, hideLabel,
}: NumberInputProps) {
  const id = useId();
  const [text, setText] = useState(value == null ? '' : fmt.format(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(value == null ? '' : fmt.format(value));
  }, [value]);

  const localErr = text !== '' && parse(text) === 'invalid' ? 'Enter a valid number' : undefined;
  const minErr = value != null && min != null && value < min ? `Must be at least ${min}` : undefined;
  const err = error ?? localErr ?? minErr;

  return (
    <div className={className}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'mb-1.5 block text-xs font-medium text-text-muted'}>
        {label}
        {tip && <Tooltip term={tip} />}
      </label>
      <div
        className={`flex min-h-10 items-center rounded-lg border bg-surface-2 px-3 focus-within:border-gold ${
          err ? 'border-error' : 'border-border hover:border-gold-muted'
        } ${readOnly ? 'opacity-70' : ''}`}
      >
        {prefix && <span className="mr-1.5 text-sm text-text-muted">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={text}
          readOnly={readOnly}
          placeholder={placeholder}
          aria-invalid={!!err}
          aria-describedby={err || hint ? `${id}-msg` : undefined}
          onFocus={() => (focused.current = true)}
          onChange={(e) => {
            const s = e.target.value;
            setText(s);
            const p = parse(s);
            if (p === 'invalid') return;
            onChange(p === null && emptyAsZero ? 0 : p);
          }}
          onBlur={() => {
            focused.current = false;
            const p = parse(text);
            setText(p === 'invalid' || p === null ? (p === 'invalid' ? text : '') : fmt.format(p));
          }}
          className="w-full min-w-0 bg-transparent py-2 text-sm text-text outline-none placeholder:text-text-muted/50 focus-visible:outline-none"
        />
        {suffix && <span className="ml-1.5 whitespace-nowrap text-sm text-text-muted">{suffix}</span>}
      </div>
      {(err || hint) && (
        <p id={`${id}-msg`} className={`mt-1 text-xs ${err ? 'text-error' : 'text-text-muted'}`}>
          {err ?? hint}
        </p>
      )}
    </div>
  );
}
