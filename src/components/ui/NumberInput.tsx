'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { formatINRWords } from '@/engine/format';
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
  /** money field: echo the value as ₹ lakh / crore under the input */
  words?: boolean;
  autoFocus?: boolean;
}

/** Accepts commas, formats en-IN on blur, never emits NaN. */
export function NumberInput({
  label, value, onChange, tip, prefix, suffix, error, hint, placeholder, className = '',
  emptyAsZero, min, readOnly, hideLabel, words, autoFocus,
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
  const echo = words && value != null && Math.abs(value) >= 1e5 ? `= ${formatINRWords(value)}` : undefined;
  const helper = [echo, hint].filter(Boolean).join(' · ');

  return (
    <div className={className}>
      <div className={hideLabel ? 'sr-only' : 'mb-2 flex min-h-5 items-center text-[13px] text-text-muted'}>
        <label htmlFor={id}>{label}</label>
        {tip && !hideLabel && <Tooltip term={tip} />}
      </div>
      <div
        className={`flex h-12 items-center rounded-2xl bg-surface-2 px-4 ring-1 transition focus-within:ring-gold/70 ${
          err ? 'ring-error' : 'ring-transparent hover:ring-white/10'
        } ${readOnly ? 'opacity-70' : ''}`}
      >
        {prefix && <span className="mr-2 text-[15px] text-text-muted">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={text}
          readOnly={readOnly}
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-invalid={!!err}
          aria-describedby={err || helper ? `${id}-msg` : undefined}
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
          className="w-full min-w-0 bg-transparent text-base text-text outline-none placeholder:text-text-muted/40 focus-visible:outline-none sm:text-[15px]"
        />
        {suffix && <span className="ml-2 whitespace-nowrap text-[13px] text-text-muted">{suffix}</span>}
      </div>
      {(err || helper) && (
        <p id={`${id}-msg`} className={`mt-1.5 text-[13px] leading-relaxed ${err ? 'text-error' : 'text-text-muted'}`}>
          {err ?? (echo ? <><span className="font-medium text-gold">{echo}</span>{hint ? ` · ${hint}` : ''}</> : hint)}
        </p>
      )}
    </div>
  );
}
