'use client';

import { formatINRWords } from '@/engine/format';
import { useApp } from '@/state/CalculatorContext';
import { AdvisorButton } from '@/components/advisor/AdvisorButton';

/** Mobile-only sticky bottom bar. */
export function StickyTotalBar() {
  const { result } = useApp();
  const allIn = result.cost?.allInCost;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 px-4 py-2.5 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-text-muted">All-in cost</p>
          <p className="font-display text-2xl leading-tight text-gold" aria-live="polite">
            {allIn != null ? formatINRWords(allIn) : '—'}
          </p>
        </div>
        <AdvisorButton compact />
      </div>
    </div>
  );
}
