'use client';

import { useMemo, useState } from 'react';
import { GLOSSARY, GLOSSARY_GROUPS } from '@/content/glossary';
import { useT } from '@/state/LanguageContext';
import { SidePanel } from './SidePanel';

/** Glossary side panel. Stays mounted, so the search text survives closing and reopening. */
export function GlossaryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const { t } = useT();

  const entries = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return Object.entries(GLOSSARY)
      .filter(([k, e]) => !e.hidden && !k.startsWith('u_') && !['vaar', 'guntha', 'vigha'].includes(k))
      .filter(([, e]) => !needle || `${e.term} ${e.tip} ${e.extra ?? ''}`.toLowerCase().includes(needle))
      .sort(([, a], [, b]) => a.term.localeCompare(b.term));
  }, [q]);

  return (
    <SidePanel open={open} onClose={onClose} titleId="glossary-title" title={t('glossary.title')} subtitle={t('glossary.sub')}>
      <div className="px-5 pb-3 sm:px-6">
        <label htmlFor="glossary-q" className="sr-only">{t('glossary.searchLabel')}</label>
        <input
          id="glossary-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('glossary.search')}
          className="h-11 w-full rounded-xl bg-surface-2 px-4 text-base ring-1 ring-transparent placeholder:text-text-muted/50 focus:outline-none focus-visible:ring-gold/70 sm:text-[15px]"
        />
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-6 sm:px-6">
        {GLOSSARY_GROUPS.map((g) => {
          const list = entries.filter(([, e]) => e.group === g);
          if (!list.length) return null;
          return (
            <section key={g} className="mb-6">
              <h3 className="mb-2 mt-2 text-xs font-semibold uppercase tracking-wider text-gold">{g}</h3>
              <dl className="divide-y divide-white/5">
                {list.map(([k, e]) => (
                  <div key={k} className="py-3">
                    <dt className="text-[15px] font-semibold">{e.term}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-text-muted">
                      {e.tip}
                      {e.extra && <span className="mt-1.5 block">{e.extra}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
        {!entries.length && <p className="text-sm text-text-muted">{t('glossary.none')}</p>}
      </div>
    </SidePanel>
  );
}
