'use client';

import { CheckIcon, ResetIcon } from '@/components/ui/Icons';
import { forwardRef, useRef } from 'react';
import { useT } from '@/state/LanguageContext';
import type { MessageKey } from '@/content/i18n';

export type TabId = 'area' | 'cost' | 'loan';
export const TABS: { id: TabId; step: number; label: MessageKey; short: MessageKey }[] = [
  { id: 'area', step: 1, label: 'step.area', short: 'step.areaShort' },
  { id: 'cost', step: 2, label: 'step.cost', short: 'step.costShort' },
  { id: 'loan', step: 3, label: 'step.loan', short: 'step.loanShort' },
];

/** The calculator's only step navigation. Arrow keys move between steps. */
export const Tabs = forwardRef<HTMLDivElement, { active: TabId; onChange: (t: TabId) => void; done: Record<TabId, boolean>; onReset: () => void }>(
  function Tabs({ active, onChange, done, onReset }, ref) {
    const { t } = useT();
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
      <div ref={ref} className="mb-5 flex items-center gap-2">
        <div role="tablist" aria-label={t('step.aria')} className="grid min-w-0 flex-1 grid-cols-3 gap-1 rounded-full bg-surface p-1 sm:inline-grid sm:flex-none">
          {TABS.map((tab, i) => {
            const on = tab.id === active;
            return (
              <button
                key={tab.id}
                ref={(el) => { refs.current[tab.id] = el; }}
                role="tab"
                id={`tab-${tab.id}`}
                aria-label={t(tab.label)}
                aria-selected={on}
                aria-controls={`panel-${tab.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => onChange(tab.id)}
                onKeyDown={(e) => onKey(e, i)}
                className={`flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-full px-2 text-[13px] font-medium transition sm:gap-2 sm:px-5 sm:text-sm ${
                  on ? 'bg-text text-black' : 'text-text-muted hover:text-text'
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    on ? 'bg-black text-text' : done[tab.id] ? 'bg-gold text-black' : 'bg-white/10'
                  }`}
                >
                  {done[tab.id] && !on ? <CheckIcon size={11} /> : tab.step}
                </span>
                <span aria-hidden className="whitespace-nowrap max-[479px]:hidden">{t(tab.label)}</span>
                <span aria-hidden className="hidden whitespace-nowrap max-[479px]:inline">{t(tab.short)}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onReset}
          aria-label={t('startOver.aria')}
          title={t('startOver.aria')}
          className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-full text-sm text-text-muted ring-1 ring-white/10 transition hover:text-gold hover:ring-gold/60 sm:w-auto sm:px-5"
        >
          <ResetIcon size={17} />
          <span className="hidden sm:inline">{t('startOver')}</span>
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
