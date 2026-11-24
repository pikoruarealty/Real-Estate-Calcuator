import { formatINR, formatPct } from '@/engine/format';
import type { CostResult } from '@/engine/types';

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-3">
      <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-text">{value}</p>
      {sub && <p className="text-[11px] text-text-muted">{sub}</p>}
    </div>
  );
}

export function EffectiveRateTiles({ cost }: { cost: CostResult }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Tile label="Per carpet sq ft" value={cost.effectiveRatePerCarpetSqft != null ? formatINR(cost.effectiveRatePerCarpetSqft) : '—'} sub="all-in" />
      <Tile label="Per SBU sq ft" value={cost.effectiveRatePerSbuSqft != null ? formatINR(cost.effectiveRatePerSbuSqft) : '—'} sub="all-in" />
      <Tile label="Over headline" value={cost.overHeadlinePct != null ? `+${formatPct(cost.overHeadlinePct, 1)}` : '—'} sub="vs base price" />
    </div>
  );
}
