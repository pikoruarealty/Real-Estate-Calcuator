'use client';

import { forwardRef, useRef } from 'react';

export type TabId = 'area' | 'cost' | 'loan';
export const TABS: { id: TabId; step: number; label: string; sub: string }[] = [
  { id: 'area', step: 1, label: 'Area & Units', sub: 'How big is it really?' },
  { id: 'cost', step: 2, label: 'Cost Sheet', sub: 'What will it really cost?' },
  { id: 'loan', step: 3, label: 'Loan & EMI', sub: 'What will I pay monthly?' },
];

export const Tabs = forwardRef<HTMLDivElement, { active: TabId; onChange: (t: TabId) => void; done: Record<TabId, boolean> }>(
  function Tabs({ active, onChange, done }, ref) {
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
      <div ref={ref} role="tablist" aria-label="Calculator steps" className="grid scroll-mt-4 grid-cols-3 gap-1 border-b border-border">
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
              className={`-mb-px flex flex-col items-center gap-0.5 border-b-2 px-1 py-2.5 text-center sm:flex-row sm:items-center sm:gap-3 sm:px-3 sm:text-left ${
                on ? 'border-gold' : 'border-transparent hover:border-border'
              }`}
            >
              <span
                aria-hidden
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  on ? 'bg-gold text-black' : done[t.id] ? 'border border-gold-muted text-gold-muted' : 'border border-border text-text-muted'
                }`}
              >
                {done[t.id] && !on ? '✓' : t.step}
              </span>
              <span className="min-w-0">
                <span className={`block text-[13px] font-semibold sm:text-sm ${on ? 'text-gold' : 'text-text'}`}>{t.label}</span>
                <span className="hidden text-xs text-text-muted sm:block">{t.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  },
);

export function NextStep({ label, onClick, back }: { label: string; onClick: () => void; back?: { label: string; onClick: () => void } }) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
      {back ? (
        <button type="button" onClick={back.onClick} className="min-h-11 rounded-lg px-3 text-sm text-text-muted hover:text-text">← {back.label}</button>
      ) : <span />}
      {label && (
        <button type="button" onClick={onClick} className="min-h-12 rounded-lg bg-gold px-5 text-sm font-semibold text-black hover:brightness-110">
          {label} →
        </button>
      )}
    </div>
  );
}
