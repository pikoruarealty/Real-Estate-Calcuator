'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { formatAreaNumber, formatPct } from '@/engine/format';
import { convert } from '@/engine/units';
import type { AreaResult, VighaVariant } from '@/engine/types';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { useT } from '@/state/LanguageContext';

/* ---------- Helpers ---------- */

/** Smoothly counts a number up/down whenever it changes (instant for reduced-motion users). */
function useCountUp(target: number | null) {
  const [val, setVal] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (target == null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      from.current = target;
      setVal(target);
      return;
    }
    const start = from.current;
    const delta = target - start;
    if (delta === 0) return;
    const t0 = performance.now();
    const dur = 700;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = start + delta * eased;
      from.current = v;
      setVal(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return target == null ? null : val;
}

/** Fade + rise in on mount, staggered. */
function Reveal({ i, children, className = '' }: { i: number; children: ReactNode; className?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        on ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      } ${className}`}
      style={{ transitionDelay: `${i * 100}ms` }}
    >
      {children}
    </div>
  );
}

const RulerIcon = () => (
  <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0z" />
    <path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2" />
  </svg>
);

/** Live area results: a big headline number, two quick conversions, an efficiency meter and one aligned table. */
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
  const shown = rows.filter((r) => r.v != null);
  // Headline = carpet if known, otherwise super built-up, otherwise RERA area.
  const hero = [rows[0], rows[2], rows[1]].find((r) => r.v != null) ?? rows[0];

  const animated = useCountUp(hero.v);
  const show = (v: number | null, to: 'sqm' | 'sqyd') => (v == null ? '—' : formatAreaNumber(convert(v, 'sqft', to, vigha)));

  // Efficiency bar fills in after mount and whenever the value changes.
  const [barW, setBarW] = useState(0);
  const effClamped = eff == null ? 0 : Math.max(0, Math.min(100, eff));
  useEffect(() => {
    const id = requestAnimationFrame(() => setBarW(effClamped));
    return () => cancelAnimationFrame(id);
  }, [effClamped]);

  return (
    <Card title={t('results.title')}>
      {empty ? (
        <div className="flex items-start gap-3 rounded-2xl border border-dashed border-white/15 p-4">
          <span className="mt-0.5 text-gold/80"><RulerIcon /></span>
          <p className="max-w-sm text-sm leading-relaxed text-text-muted">{t('results.empty')}</p>
        </div>
      ) : (
        <div aria-live="polite" className="space-y-4">
          {/* 1. Headline number */}
          <Reveal i={0}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold/15 via-gold/[0.05] to-transparent p-5 ring-1 ring-gold/30">
              <span aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-gold/20 blur-3xl" />
              <p className="relative flex items-center text-xs font-medium uppercase tracking-wider text-gold/90">
                {hero.label}
                <Tooltip term={hero.tip} />
              </p>
              <p className="relative mt-2 flex flex-wrap items-baseline gap-x-2 leading-none">
                <span className="text-4xl font-bold tabular-nums tracking-tight text-gold sm:text-5xl">
                  {animated == null ? '—' : formatAreaNumber(animated)}
                </span>
                <span className="text-base font-medium text-text-muted">{t('results.sqft')}</span>
              </p>
              <div className="relative mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-black/30 px-3 py-2.5 ring-1 ring-white/10">
                  <p className="flex items-center text-[11px] uppercase tracking-wider text-text-muted">
                    {t('results.sqm')}
                    <Tooltip term="u_sqm" />
                  </p>
                  <p className="mt-0.5 text-[17px] font-semibold tabular-nums">{animated == null ? '—' : show(animated, 'sqm')}</p>
                </div>
                <div className="rounded-xl bg-black/30 px-3 py-2.5 ring-1 ring-white/10">
                  <p className="flex items-center text-[11px] uppercase tracking-wider text-text-muted">
                    {t('results.sqyd')}
                    <Tooltip term="u_sqyd" />
                  </p>
                  <p className="mt-0.5 text-[17px] font-semibold tabular-nums">{animated == null ? '—' : show(animated, 'sqyd')}</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 2. Efficiency meter (or a hint on what to add) */}
          <Reveal i={1}>
            {eff != null ? (
              <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
                <div className="flex items-end justify-between gap-4">
                  <p className="text-[15px] leading-relaxed">{t('results.efficiency', { pay: 100, use: Math.round(eff) })}</p>
                  <span className="shrink-0 text-3xl font-bold tabular-nums leading-none text-gold">{Math.round(eff)}%</span>
                </div>
                <div
                  className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(effClamped)}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold shadow-[0_0_12px_rgba(212,175,55,0.5)] transition-[width] duration-1000 ease-out motion-reduce:transition-none"
                    style={{ width: `${barW}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
                  <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-text-muted">
                    {t('results.loading')}&nbsp;<b className="font-semibold text-text">{formatPct(area.loadingPct ?? 0, 1)}</b>
                    <Tooltip term="loading" />
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-text-muted">
                    {t('results.kapat')}&nbsp;<b className="font-semibold text-text">{formatPct(area.kapatPct ?? 0, 1)}</b>
                    <Tooltip term="kapat" />
                  </span>
                </div>
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-gold/30 bg-gold/[0.04] p-4 text-sm leading-relaxed text-text-muted">
                {t('results.needPct')}
              </p>
            )}
          </Reveal>

          {/* 3. Full table (only rows that have a value, so no wall of dashes) */}
          <Reveal i={2}>
            <div className="overflow-x-auto rounded-2xl ring-1 ring-white/[0.06]">
              <table className="w-full min-w-[17rem] text-sm">
                <thead>
                  <tr className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-text-muted">
                    <th scope="col" className="px-3 py-2.5 text-left font-medium">{t('results.area')}</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium text-gold/90">{t('results.sqft')}</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">{t('results.sqm')}</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">{t('results.sqyd')}</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((r) => {
                    const isHero = r.tip === hero.tip;
                    return (
                      <tr
                        key={r.tip}
                        className={`border-t border-white/5 transition-colors duration-200 hover:bg-white/[0.05] ${isHero ? 'bg-gold/[0.06]' : ''}`}
                      >
                        <th scope="row" className={`px-3 py-3 text-left font-medium ${isHero ? 'text-text' : 'text-text-muted'}`}>
                          {r.label}
                          <Tooltip term={r.tip} />
                        </th>
                        <td className={`px-3 py-3 text-right text-[15px] font-semibold tabular-nums ${isHero ? 'text-gold' : 'text-text'}`}>
                          {formatAreaNumber(r.v as number)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-text-muted">{show(r.v, 'sqm')}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-text-muted">{show(r.v, 'sqyd')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      )}
    </Card>
  );
}