'use client';

import { formatAreaNumber, formatPct } from '@/engine/format';
import { convert } from '@/engine/units';
import type { AreaResult, VighaVariant } from '@/engine/types';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';

function Big({ label, value, tip, gold }: { label: string; value: number | null; tip: string; gold?: boolean }) {
  return (
    <div>
      <p className="flex items-center text-[13px] text-text-muted">{label}<Tooltip term={tip} /></p>
      <p className={`mt-1 text-3xl font-semibold tracking-tight sm:text-4xl ${gold ? 'text-gold' : 'text-text'}`}>
        {value != null ? formatAreaNumber(value) : '—'}
        <span className="ml-1.5 text-base font-normal text-text-muted">sq ft</span>
      </p>
    </div>
  );
}

export function AreaResultCard({ area, vigha }: { area: AreaResult; vigha: VighaVariant }) {
  const empty = area.carpetSqft == null && area.sbuSqft == null;
  const eff = area.efficiencyPct;
  const rows: { label: string; v: number | null; tip: string }[] = [
    { label: 'Carpet', v: area.carpetSqft, tip: 'carpet' },
    { label: 'RERA area', v: area.reraAreaSqft, tip: 'reraArea' },
    { label: 'Super built-up', v: area.sbuSqft, tip: 'sbu' },
    { label: 'Common area', v: area.commonAreaSqft, tip: 'commonArea' },
  ];
  const show = (v: number | null, to: 'sqm' | 'sqyd') => (v == null ? '—' : formatAreaNumber(convert(v, 'sqft', to, vigha)));

  if (empty) {
    return (
      <Card>
        <div className="flex flex-col items-center px-4 py-10 text-center">
          <span aria-hidden className="mb-4 text-4xl">📐</span>
          <p className="text-[15px] font-medium">Your true size shows up here</p>
          <p className="mt-1 max-w-xs text-sm text-text-muted">How much you can actually use, and how much you’re paying for.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="grid grid-cols-2 gap-4">
        <Big label="You get to use" value={area.carpetSqft} tip="carpet" gold />
        <Big label="You pay for" value={area.sbuSqft} tip="sbu" />
      </div>

      {eff != null ? (
        <div className="mt-6">
          <div className="flex h-3 overflow-hidden rounded-full bg-white/[0.06]" role="img" aria-label={`${formatPct(eff, 0)} usable, ${formatPct(100 - eff, 0)} common areas`}>
            <div className="rounded-full bg-gold transition-all duration-500" style={{ width: `${eff}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[13px]">
            <span className="text-gold">{formatPct(eff, 0)} yours<Tooltip term="efficiency" /></span>
            <span className="text-text-muted">{formatPct(100 - eff, 0)} common areas<Tooltip term="commonArea" /></span>
          </div>
          <p className="mt-5 text-[15px] leading-relaxed text-text">
            For every <b>100 sq ft</b> you pay for, you can use <b className="text-gold">{Math.round(eff)}</b>.
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Loading {formatPct(area.loadingPct ?? 0, 1)}<Tooltip term="loading" /> · Kapat {formatPct(area.kapatPct ?? 0, 1)}<Tooltip term="kapat" />
          </p>
        </div>
      ) : (
        <p className="mt-5 text-sm leading-relaxed text-text-muted">Add the loading or kapat % to see how much of what you pay for is really yours.</p>
      )}

      <details className="group mt-6 border-t border-white/5 pt-4">
        <summary className="flex min-h-8 items-center justify-between text-sm text-text-muted hover:text-text">
          In sq m and sq yd
          <svg aria-hidden className="transition group-open:rotate-180" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </summary>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-text-muted">
              <th scope="col" className="py-1.5 font-normal">Area</th>
              <th scope="col" className="py-1.5 text-right font-normal">Sq ft</th>
              <th scope="col" className="py-1.5 text-right font-normal">Sq m<Tooltip term="u_sqm" /></th>
              <th scope="col" className="py-1.5 text-right font-normal">Sq yd<Tooltip term="u_sqyd" /></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-white/5">
                <th scope="row" className="py-2 text-left font-normal">{r.label}<Tooltip term={r.tip} /></th>
                <td className="py-2 text-right">{r.v == null ? '—' : formatAreaNumber(r.v)}</td>
                <td className="py-2 text-right">{show(r.v, 'sqm')}</td>
                <td className="py-2 text-right">{show(r.v, 'sqyd')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Card>
  );
}
