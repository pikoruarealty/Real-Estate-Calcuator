import { formatINRWords, formatPct } from '@/engine/format';
import type { CostResult } from '@/engine/types';
import { Tooltip } from '@/components/ui/Tooltip';

/** Gold + greys only (§8). The 4th segment is hatched so it never relies on colour alone. */
export function CompositionBar({ cost }: { cost: CostResult }) {
  const parts = [
    { label: 'Agreement value (base, FRC, PLC…)', tip: 'av', v: cost.agreementValue, bg: 'var(--color-gold)' },
    { label: 'Other builder charges', tip: 'blockB', v: cost.otherChargesTotal, bg: '#8c887e' },
    { label: 'GST', tip: 'gst', v: cost.gstOnAgreementValue + cost.otherChargesGst, bg: '#4a4843' },
    {
      label: 'Stamp duty + registration',
      tip: 'governmentTotal',
      v: cost.governmentTotal,
      bg: 'repeating-linear-gradient(45deg,#8c887e 0 4px,#2a2a2a 4px 8px)',
    },
  ];
  const total = cost.allInCost || 1;
  return (
    <figure aria-label="Where your money goes">
      <div className="flex h-4 w-full overflow-hidden rounded-full border border-border" role="img"
        aria-label={parts.map((p) => `${p.label} ${formatPct((p.v / total) * 100, 1)}`).join(', ')}>
        {parts.map((p) => p.v > 0 && (
          <div key={p.label} style={{ width: `${(p.v / total) * 100}%`, background: p.bg }} />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-1.5 text-sm">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2 text-text-muted">
            <span aria-hidden className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm border border-border" style={{ background: p.bg }} />
            <span className="flex flex-1 items-center">{p.label}<Tooltip term={p.tip} /></span>
            <span className="whitespace-nowrap text-text">{formatINRWords(p.v)} · {formatPct((p.v / total) * 100, 1)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
