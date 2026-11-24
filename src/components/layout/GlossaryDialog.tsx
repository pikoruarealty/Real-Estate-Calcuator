'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { GLOSSARY, GLOSSARY_GROUPS } from '@/content/glossary';

export function GlossaryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const entries = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return Object.entries(GLOSSARY)
      .filter(([k, e]) => !e.hidden && !k.startsWith('u_') && !['vaar', 'guntha', 'vigha'].includes(k))
      .filter(([, e]) => !needle || `${e.term} ${e.tip} ${e.extra ?? ''}`.toLowerCase().includes(needle))
      .sort(([, a], [, b]) => a.term.localeCompare(b.term));
  }, [q]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="glossary-title"
      className="m-auto h-[min(85vh,48rem)] w-[min(40rem,calc(100vw-1.5rem))] rounded-xl border border-border bg-surface p-0 text-text backdrop:bg-black/70"
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-border p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="glossary-title" className="font-display text-2xl">Glossary</h2>
              <p className="text-sm text-text-muted">Every property word you’ll hear, in plain English.</p>
            </div>
            <button type="button" aria-label="Close glossary" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:text-text">✕</button>
          </div>
          <label htmlFor="glossary-q" className="sr-only">Search the glossary</label>
          <input
            id="glossary-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search, e.g. kapat, stamp duty, EMI"
            className="mt-3 min-h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm placeholder:text-text-muted/60 focus:border-gold"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {GLOSSARY_GROUPS.map((g) => {
            const list = entries.filter(([, e]) => e.group === g);
            if (!list.length) return null;
            return (
              <section key={g} className="mb-6">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold">{g}</h3>
                <dl className="space-y-3">
                  {list.map(([k, e]) => (
                    <div key={k} className="rounded-lg border border-border bg-bg p-3">
                      <dt className="text-sm font-semibold">{e.term}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-text-muted">
                        {e.tip}
                        {e.extra && <span className="mt-1.5 block text-text-muted/90">{e.extra}</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}
          {!entries.length && <p className="text-sm text-text-muted">No match. Try another word.</p>}
        </div>
      </div>
    </dialog>
  );
}
