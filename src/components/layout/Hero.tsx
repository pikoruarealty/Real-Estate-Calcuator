'use client';

import { useMemo } from 'react';
import { calculate } from '@/engine';
import { formatINR, formatINRWords, formatPct } from '@/engine/format';
import { exampleInput } from '@/state/defaults';
import { useT } from '@/state/LanguageContext';
import { Button } from '@/components/ui/Button';

/** A real worked example straight from the engine, clearly labelled as an example. */
function ExampleSummary() {
  const { t } = useT();
  const { cost, input, area } = useMemo(() => {
    const input = exampleInput();
    const r = calculate(input);
    return { input, cost: r.cost!, area: r.area };
  }, []);
  const rows: [string, string][] = [
    [t('example.carpet'), `${Math.round(area.carpetSqft ?? 0).toLocaleString('en-IN')} sq ft`],
    [t('example.quoted'), `${formatINR(input.cost.baseRate ?? 0)} / sq ft`],
  ];
  return (
    <figure className="rounded-2xl bg-surface p-5 ring-1 ring-white/[0.06]">
      <figcaption className="flex items-center gap-2 text-[13px] text-text-muted">
        <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-xs font-medium text-text">{t('example.label')}</span>
        {t('example.title')}
      </figcaption>
      <dl className="mt-4 space-y-1.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-text-muted">{k}</dt>
            <dd className="tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-end justify-between gap-4 border-t border-white/5 pt-4">
        <div>
          <p className="text-[13px] text-text-muted">{t('example.real')}</p>
          <p className="text-3xl font-semibold tracking-tight text-gold">{formatINRWords(cost.allInCost)}</p>
        </div>
        <p className="pb-1 text-sm text-text-muted">+{formatPct(cost.overHeadlinePct ?? 0, 0)} {t('example.over')}</p>
      </div>
    </figure>
  );
}

export function Hero({ onExample, onHow }: { onExample: () => void; onHow: () => void }) {
  const { t } = useT();
  const title = t('hero.title');
  const accent = t('hero.accent');
  const at = title.indexOf(accent);
  return (
    <section className="grid items-center gap-8 pb-8 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,4fr)] lg:gap-12">
      <div>
        <h1 className="text-[30px] font-semibold leading-[1.15] tracking-tight text-text sm:text-4xl lg:text-5xl">
          {at >= 0 ? (
            <>
              {title.slice(0, at)}<span className="text-gold">{accent}</span>{title.slice(at + accent.length)}
            </>
          ) : title}
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-text-muted">{t('hero.sub')}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={onExample}>{t('hero.try')}</Button>
          <Button variant="secondary" onClick={onHow}>{t('hero.how')}</Button>
        </div>
      </div>
      <ExampleSummary />
    </section>
  );
}
