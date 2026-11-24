import { formatINRWords, formatPct } from '@/engine/format';
import type { CostResult } from '@/engine/types';
import { Tooltip } from '@/components/ui/Tooltip';

/** Where the money goes: gold + greys only. */
export function CompositionBar({ cost }: { cost: CostResult }) {
  const parts = [
    { label: 'Home price', tip: 'av', v: cost.agreementValue, bg: 'var(--color-gold)' },
    { label: 'Builder extras', tip: 'blockB', v: cost.otherChargesTotal, bg: '#8c887e' },
    { label: 'GST', tip: 'gst', v: cost.gstOnAgreementValue + cost.otherChargesGst, bg: '#55524c' },
    { label: 'Stamp duty & registration', tip: 'governmentTotal', v: cost.governmentTotal, bg: '#34322f' },
  ].filter((p) => p.v > 0);
  const total = cost.allInCost || 1;
  return (
    <figure aria-label="Where your money goes">
      <div
        className="flex h-2.5 gap-[3px] overflow-hidden rounded-full"
        role="img"
        aria-label={parts.map((p) => `${p.label} ${formatPct((p.v / total) * 100, 1)}`).join(', ')}
      >
        {parts.map((p) => (
          <div key={p.label} className="rounded-full transition-all duration-500" style={{ width: `${(p.v / total) * 100}%`, background: p.bg }} />
        ))}
      </div>
      <ul className="mt-4 space-y-2.5">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-3 text-sm">
            <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.bg }} />
            <span className="flex flex-1 items-center text-text-muted">{p.label}<Tooltip term={p.tip} /></span>
            <span className="tabular-nums text-text">{formatINRWords(p.v)}</span>
            <span className="w-12 text-right text-[13px] tabular-nums text-text-muted">{formatPct((p.v / total) * 100, 0)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
