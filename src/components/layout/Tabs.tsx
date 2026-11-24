'use client';

import { useRef } from 'react';

export type TabId = 'area' | 'cost' | 'loan';
export const TABS: { id: TabId; label: string }[] = [
  { id: 'area', label: 'Area & Units' },
  { id: 'cost', label: 'Cost Sheet' },
  { id: 'loan', label: 'Loan & EMI' },
];

export function Tabs({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onKey = (e: React.KeyboardEvent, i: number) => {
    let n = i;
    if (e.key === 'ArrowRight') n = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = TABS.length - 1;
    else return;
    e.preventDefault();
    onChange(TABS[n].id);
    refs.current[TABS[n].id]?.focus();
  };
  return (
    <div role="tablist" aria-label="Calculator sections" className="flex gap-1 overflow-x-auto border-b border-border">
      {TABS.map((t, i) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            ref={(el) => { refs.current[t.id] = el; }}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={on}
            aria-controls={`panel-${t.id}`}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
              on ? 'border-gold text-gold' : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
