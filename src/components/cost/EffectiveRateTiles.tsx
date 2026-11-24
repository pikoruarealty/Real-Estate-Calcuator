import { formatINR, formatPct } from '@/engine/format';
import type { CostResult } from '@/engine/types';
import { Tooltip } from '@/components/ui/Tooltip';

function Tile({ label, value, sub, tip }: { label: string; value: string; sub?: string; tip: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-3">
      <p className="flex items-center text-[11px] uppercase tracking-wide text-text-muted">{label}<Tooltip term={tip} /></p>
      <p className="mt-1 text-lg font-semibold text-text">{value}</p>
      {sub && <p className="text-[11px] text-text-muted">{sub}</p>}
    </div>
  );
}

export function EffectiveRateTiles({ cost }: { cost: CostResult }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <Tile tip="effCarpet" label="Per carpet sq ft" value={cost.effectiveRatePerCarpetSqft != null ? formatINR(cost.effectiveRatePerCarpetSqft) : '—'} sub="Best for comparing projects" />
      <Tile tip="effSbu" label="Per SBU sq ft" value={cost.effectiveRatePerSbuSqft != null ? formatINR(cost.effectiveRatePerSbuSqft) : '—'} sub="Compare with the base rate" />
      <Tile tip="overHeadline" label="More than base price" value={cost.overHeadlinePct != null ? `+${formatPct(cost.overHeadlinePct, 1)}` : '—'} sub="Extra charges + taxes" />
    </div>
  );
}
