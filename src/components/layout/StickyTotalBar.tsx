'use client';

import { formatINRWords } from '@/engine/format';
import { useApp } from '@/state/CalculatorContext';
import { AdvisorButton } from '@/components/advisor/AdvisorButton';

/** Mobile-only bottom bar: the one number that matters, always visible. */
export function StickyTotalBar({ onSeeCost }: { onSeeCost: () => void }) {
  const { result } = useApp();
  const allIn = result.cost?.allInCost;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-bg px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden">
      <div className="flex items-center justify-between gap-3">
        {allIn != null ? (
          <button type="button" onClick={onSeeCost} className="min-w-0 text-left" aria-label={`All-in cost ${formatINRWords(allIn)}. See the breakup.`}>
            <span className="block text-[11px] text-text-muted">All-in cost</span>
            <span className="text-xl font-semibold tracking-tight text-gold" aria-live="polite">{formatINRWords(allIn)}</span>
          </button>
        ) : (
          <p className="text-[13px] text-text-muted">Your total shows here</p>
        )}
        <AdvisorButton compact />
      </div>
    </div>
  );
}
