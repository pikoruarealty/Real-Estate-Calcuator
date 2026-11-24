'use client';

import { formatAreaNumber, formatPct } from '@/engine/format';
import { convert } from '@/engine/units';
import type { AreaResult, VighaVariant } from '@/engine/types';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { useT } from '@/state/LanguageContext';

/** Live area results: one aligned table (sq ft, sq m, sq yd) and one plain-language line. */
export function AreaResultCard({ area, vigha }: { area: AreaResult; vigha: VighaVariant }) {
  const { t } = useT();
  const empty = area.carpetSqft == null && area.sbuSqft == null;
  const eff = area.efficiencyPct;
  const rows = [
    { label: t('results.carpet'), v: area.carpetSqft, tip: 'carpet' },
    { label: t('results.rera'), v: area.reraAreaSqft, tip: 'reraArea' },
    { label: t('results.sbu'), v: area.sbuSqft, tip: 'sbu' },
    { label: t('results.common'), v: area.commonAreaSqft, tip: 'commonArea' },
  ];
  const show = (v: number | null, to: 'sqm' | 'sqyd') => (v == null ? '—' : formatAreaNumber(convert(v, 'sqft', to, vigha)));

  return (
    <Card title={t('results.title')}>
      {empty ? (
        <p className="max-w-sm text-sm leading-relaxed text-text-muted">{t('results.empty')}</p>
      ) : (
        <div aria-live="polite">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-text-muted">
                <th scope="col" className="pb-2 text-left font-normal">{t('results.area')}</th>
                <th scope="col" className="pb-2 text-right font-normal">{t('results.sqft')}</th>
                <th scope="col" className="pb-2 text-right font-normal">{t('results.sqm')}<Tooltip term="u_sqm" /></th>
                <th scope="col" className="pb-2 text-right font-normal">{t('results.sqyd')}<Tooltip term="u_sqyd" /></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.tip} className="border-t border-white/5">
                  <th scope="row" className="py-3 text-left font-normal text-text-muted">{r.label}<Tooltip term={r.tip} /></th>
                  <td className={`py-3 text-right tabular-nums ${i === 0 ? 'font-semibold text-gold' : 'font-medium'}`}>{r.v == null ? '—' : formatAreaNumber(r.v)}</td>
                  <td className="py-3 text-right tabular-nums text-text-muted">{show(r.v, 'sqm')}</td>
                  <td className="py-3 text-right tabular-nums text-text-muted">{show(r.v, 'sqyd')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {eff != null ? (
            <div className="mt-4 border-t border-white/5 pt-4">
              <p className="text-[15px] leading-relaxed">
                {t('results.efficiency', { pay: 100, use: Math.round(eff) })}
              </p>
              <p className="mt-1 text-[13px] text-text-muted">
                {t('results.loading')} {formatPct(area.loadingPct ?? 0, 1)}<Tooltip term="loading" /> · {t('results.kapat')} {formatPct(area.kapatPct ?? 0, 1)}<Tooltip term="kapat" />
              </p>
            </div>
          ) : (
            <p className="mt-4 border-t border-white/5 pt-4 text-sm leading-relaxed text-text-muted">{t('results.needPct')}</p>
          )}
        </div>
      )}
    </Card>
  );
}
