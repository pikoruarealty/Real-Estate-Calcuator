'use client';

import { formatAreaNumber, formatPct } from '@/engine/format';
import { convert } from '@/engine/units';
import type { AreaResult, VighaVariant } from '@/engine/types';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';

function Chip({ label, value, tip }: { label: string; value: number | null; tip: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}<Tooltip term={tip} /></p>
      <p className="text-lg font-semibold text-gold">{value != null ? formatPct(value) : '—'}</p>
    </div>
  );
}

export function AreaResultCard({ area, vigha }: { area: AreaResult; vigha: VighaVariant }) {
  const rows: { label: string; v: number | null; tip: string }[] = [
    { label: 'Carpet', v: area.carpetSqft, tip: 'carpet' },
    { label: 'RERA area', v: area.reraAreaSqft, tip: 'reraArea' },
    { label: 'Super built-up', v: area.sbuSqft, tip: 'sbu' },
    { label: 'Common area', v: area.commonAreaSqft, tip: 'commonArea' },
  ];
  const show = (v: number | null, to: 'sqft' | 'sqm' | 'sqyd') => (v == null ? '—' : formatAreaNumber(convert(v, 'sqft', to, vigha)));
  const empty = area.carpetSqft == null && area.sbuSqft == null;

  return (
    <Card title="Your true areas" subtitle="What you actually get vs. what you pay for.">
      {empty ? (
        <p className="text-sm leading-relaxed text-text-muted">Enter an area to see the carpet area (what you use), the super built-up area (what you usually pay for) and the difference between them, in sq ft, sq m and sq yd.</p>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted">
                  <th scope="col" className="py-1 pr-2 font-medium">Area</th>
                  <th scope="col" className="px-2 py-1 text-right font-medium">Sq ft<Tooltip term="u_sqft" /></th>
                  <th scope="col" className="px-2 py-1 text-right font-medium">Sq m<Tooltip term="u_sqm" /></th>
                  <th scope="col" className="py-1 pl-2 text-right font-medium">Sq yd<Tooltip term="u_sqyd" /></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.label} className={i % 2 ? '' : 'bg-surface-2/60'}>
                    <th scope="row" className="py-2 pl-2 pr-2 text-left font-normal">{r.label}{r.tip && <Tooltip term={r.tip} />}</th>
                    <td className="px-2 py-2 text-right">{show(r.v, 'sqft')}</td>
                    <td className="px-2 py-2 text-right">{show(r.v, 'sqm')}</td>
                    <td className="py-2 pl-2 pr-2 text-right">{show(r.v, 'sqyd')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Chip label="Loading" value={area.loadingPct} tip="loading" />
            <Chip label="Kapat" value={area.kapatPct} tip="kapat" />
            <Chip label="Efficiency" value={area.efficiencyPct} tip="efficiency" />
          </div>
          {area.efficiencyPct != null && area.carpetSqft != null && area.sbuSqft != null && (
            <div className="space-y-1.5 rounded-lg bg-surface-2 p-3 text-sm leading-relaxed text-text">
              <p>
                For every 100 sq ft you pay for, you use <strong className="text-gold">{formatAreaNumber(area.efficiencyPct)}</strong> sq ft.
              </p>
              <p className="text-text-muted">
                You can actually use <strong className="text-text">{formatAreaNumber(area.carpetSqft)} sq ft</strong>, but you are charged for{' '}
                <strong className="text-text">{formatAreaNumber(area.sbuSqft)} sq ft</strong>. The other{' '}
                {formatAreaNumber(area.sbuSqft - area.carpetSqft)} sq ft is your share of lobbies, lifts, stairs and amenities.
              </p>
            </div>
          )}
          {area.carpetSqft != null && area.sbuSqft == null && (
            <p className="rounded-lg bg-surface-2 p-3 text-sm leading-relaxed text-text-muted">
              Add the loading or kapat % (or switch to “Both”) to see the super built-up area. Most Ahmedabad builders charge on it.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
