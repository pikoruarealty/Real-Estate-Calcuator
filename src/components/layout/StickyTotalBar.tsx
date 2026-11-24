'use client';

import { formatINRWords } from '@/engine/format';
import { useApp } from '@/state/CalculatorContext';
import { AdvisorButton } from '@/components/advisor/AdvisorButton';
import { Tooltip } from '@/components/ui/Tooltip';

/** Mobile-only sticky bottom bar. */
export function StickyTotalBar({ onSeeCost }: { onSeeCost: () => void }) {
  const { result } = useApp();
  const allIn = result.cost?.allInCost;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg px-4 py-2.5 md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center text-[11px] uppercase tracking-wide text-text-muted">All-in cost<Tooltip term="allIn" /></p>
          {allIn != null ? (
            <button type="button" onClick={onSeeCost} className="text-left" aria-label={`All-in cost ${formatINRWords(allIn)}. See the full breakup.`}>
              <span className="font-display text-2xl leading-tight text-gold" aria-live="polite">{formatINRWords(allIn)}</span>
              <span className="ml-2 text-xs text-gold-muted underline">breakup</span>
            </button>
          ) : (
            <p className="text-sm text-text-muted">Fill in steps 1 &amp; 2</p>
          )}
        </div>
        <AdvisorButton compact />
      </div>
    </div>
  );
}
