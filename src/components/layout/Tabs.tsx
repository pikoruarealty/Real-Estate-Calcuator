'use client';

import { CheckIcon, ResetIcon } from '@/components/ui/Icons';
import { forwardRef, useRef } from 'react';

export type TabId = 'area' | 'cost' | 'loan';
export const TABS: { id: TabId; step: number; label: string; short: string }[] = [
  { id: 'area', step: 1, label: 'Area', short: 'Area' },
  { id: 'cost', step: 2, label: 'Cost Sheet', short: 'Cost' },
  { id: 'loan', step: 3, label: 'Loan & EMI', short: 'Loan' },
];

/** Pill stepper. Arrow keys move between steps. */
export const Tabs = forwardRef<HTMLDivElement, { active: TabId; onChange: (t: TabId) => void; done: Record<TabId, boolean>; onReset: () => void }>(
  function Tabs({ active, onChange, done, onReset }, ref) {
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
      <div ref={ref} className="sticky top-0 z-30 -mx-4 flex scroll-mt-0 items-center gap-2 bg-bg/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div role="tablist" aria-label="Calculator steps" className="grid min-w-0 flex-1 grid-cols-3 gap-1 rounded-full bg-surface p-1 sm:inline-grid sm:flex-none">
          {TABS.map((t, i) => {
            const on = t.id === active;
            return (
              <button
                key={t.id}
                ref={(el) => { refs.current[t.id] = el; }}
                role="tab"
                id={`tab-${t.id}`}
                aria-label={t.label}
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
                  {done[t.id] && !on ? <CheckIcon size={11} /> : t.step}
                </span>
                <span aria-hidden className="whitespace-nowrap max-[399px]:hidden">{t.label}</span>
                <span aria-hidden className="hidden whitespace-nowrap max-[399px]:inline">{t.short}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onReset}
          aria-label="Start over: clear everything"
          title="Start over: clear everything"
          className="ml-auto flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 text-sm font-medium text-text transition hover:border-gold hover:text-gold sm:h-11 sm:w-auto sm:px-5"
        >
          <ResetIcon size={17} />
          <span className="hidden sm:inline">Start over</span>
        </button>
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
