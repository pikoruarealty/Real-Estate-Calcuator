'use client';

import { useId, useState } from 'react';
import { GLOSSARY } from '@/content/glossary';

/** ⓘ button revealing a glossary tooltip on hover, focus or tap. */
export function Tooltip({ term, text }: { term?: string; text?: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const entry = term ? GLOSSARY[term] : undefined;
  const body = text ?? entry?.tip;
  if (!body) return null;
  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={`About ${entry?.term ?? 'this term'}`}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-gold-muted text-[10px] leading-none text-gold-muted hover:text-gold"
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          id={id}
          className="absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 rounded-md border border-border bg-surface-2 p-3 text-xs font-normal normal-case leading-relaxed text-text shadow-xl"
        >
          {entry && <strong className="mb-1 block text-gold">{entry.term}</strong>}
          {body}
        </span>
      )}
    </span>
  );
}
