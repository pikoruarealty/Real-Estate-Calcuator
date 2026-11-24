'use client';

import { forwardRef, useRef } from 'react';

export type TabId = 'area' | 'cost' | 'loan';
export const TABS: { id: TabId; step: number; label: string }[] = [
  { id: 'area', step: 1, label: 'Area' },
  { id: 'cost', step: 2, label: 'Cost Sheet' },
  { id: 'loan', step: 3, label: 'Loan & EMI' },
];

/** Pill stepper. Arrow keys move between steps. */
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
      <div ref={ref} className="sticky top-0 z-30 -mx-4 scroll-mt-0 bg-bg/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div role="tablist" aria-label="Calculator steps" className="grid grid-cols-3 gap-1 rounded-full bg-surface p-1 sm:inline-grid">
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
                className={`flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-full px-2 text-[13px] font-medium transition sm:gap-2 sm:px-5 sm:text-sm ${
                  on ? 'bg-text text-black' : 'text-text-muted hover:text-text'
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    on ? 'bg-black text-text' : done[t.id] ? 'bg-gold text-black' : 'bg-white/10'
                  }`}
                >
                  {done[t.id] && !on ? '✓' : t.step}
                </span>
                <span className="whitespace-nowrap">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);

export function NextStep({ label, onClick, back }: { label?: string; onClick?: () => void; back?: { label: string; onClick: () => void } }) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      {back ? (
        <button type="button" onClick={back.onClick} className="min-h-11 rounded-full px-2 text-sm text-text-muted hover:text-text">← {back.label}</button>
      ) : <span />}
      {label && onClick && (
        <button type="button" onClick={onClick} className="min-h-12 rounded-full bg-gold px-6 text-sm font-semibold text-black transition hover:brightness-110">
          {label} →
        </button>
      )}
    </div>
  );
}
