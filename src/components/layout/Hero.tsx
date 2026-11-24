'use client';

import { useMemo } from 'react';
import { BRAND } from '@/config/brand';
import { calculate } from '@/engine';
import { RATES_UPDATED_ON } from '@/engine/config';
import { monthYear } from '@/lib/dates';
import { formatINR, formatINRWords, formatPct } from '@/engine/format';
import { exampleInput } from '@/state/defaults';
import { Button } from '@/components/ui/Button';
import { ReceiptIcon } from '@/components/ui/Icons';

/** A real worked example from the engine, so the hero teaches the idea at a glance. */
function ExampleReceipt({ onOpen }: { onOpen: () => void }) {
  const ex = useMemo(() => {
    const input = exampleInput();
    const r = calculate(input);
    return { input, cost: r.cost!, area: r.area };
  }, []);
  const { cost, input, area } = ex;
  const rows: [string, number][] = [
    ['Base price', cost.basePrice],
    ['Floor rise & PLC', cost.agreementValue - cost.basePrice],
    ['Builder’s extra charges', cost.otherChargesTotal],
    ['GST', cost.gstOnAgreementValue + cost.otherChargesGst],
    ['Stamp duty & registration', cost.governmentTotal],
  ];
  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none absolute -inset-10 rounded-full bg-gold/[0.07] blur-3xl" />
      <figure className="relative rounded-3xl bg-surface p-6 shadow-2xl shadow-black/50 ring-1 ring-white/[0.06]">
        <figcaption className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold"><ReceiptIcon size={20} /></span>
          <span>
            <span className="block text-sm font-semibold">Example: 3BHK in Ahmedabad</span>
            <span className="block text-[13px] text-text-muted">
              {Math.round(area.carpetSqft ?? 0).toLocaleString('en-IN')} sq ft carpet · quoted {formatINR(input.cost.baseRate ?? 0)}/sq ft
            </span>
          </span>
        </figcaption>

        <dl className="mt-5 space-y-2.5 text-sm">
          {rows.map(([k, v], i) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-text-muted">{i > 0 ? '+ ' : ''}{k}</dt>
              <dd className="tabular-nums">{formatINRWords(v)}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 border-t border-dashed border-white/10 pt-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[13px] text-text-muted">Real price</p>
              <p className="text-4xl font-semibold tracking-tight text-gold">{formatINRWords(cost.allInCost)}</p>
            </div>
            <span className="mb-1 rounded-full bg-gold/15 px-2.5 py-1 text-[13px] font-medium text-gold">
              +{formatPct(cost.overHeadlinePct ?? 0, 0)} over quote
            </span>
          </div>
          <p className="mt-2 text-[13px] text-text-muted">
            That’s really <b className="text-text">{formatINR(cost.effectiveRatePerCarpetSqft ?? 0)}</b> per sq ft you can use, not {formatINR(input.cost.baseRate ?? 0)}.
          </p>
        </div>

        <button type="button" onClick={onOpen} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white/[0.06] text-sm text-text transition hover:bg-white/10">
          Open this example in the calculator <span aria-hidden>→</span>
        </button>
      </figure>
    </div>
  );
}

const RATES_DATE = monthYear(RATES_UPDATED_ON);

export function Hero({ onExample }: { onExample: () => void }) {
  const parts = BRAND.tagline.split(/(real)/i);
  return (
    <section className="grid items-center gap-12 pb-8 pt-8 sm:pb-12 sm:pt-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:pb-16 lg:pt-16">
      <div>
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-1 text-[13px] text-text-muted">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />
          Free · No sign-up · Gujarat rates as of {RATES_DATE}
        </p>
        <h1 className="text-[30px] font-semibold leading-[1.1] tracking-tight text-text sm:text-5xl lg:text-[56px]">
          {parts.map((p, i) => (/^real$/i.test(p) ? <span key={i} className="text-gold">{p}</span> : p))}
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-text-muted sm:text-lg">
          The rate a builder quotes is just the start. Tell us the size and price, and we’ll add every charge and tax and work out your EMI.
        </p>

        <ul className="mt-6 grid max-w-xl gap-3 text-sm sm:grid-cols-3">
          {[
            ['1', 'True size', 'Carpet vs super built-up'],
            ['2', 'Real cost', 'Every charge & tax'],
            ['3', 'Your EMI', 'And cash to keep ready'],
          ].map(([n, t, s]) => (
            <li key={n} className="flex items-start gap-3 sm:block">
              <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-semibold text-gold sm:mb-2">{n}</span>
              <span>
                <span className="block font-medium text-text">{t}</span>
                <span className="block text-[13px] text-text-muted">{s}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
          <Button onClick={onExample}>Try an example</Button>
          <span className="ml-1 text-[13px] text-text-muted">
            Tap <span aria-hidden className="mx-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/[0.07] align-[-2px] text-[10px] font-semibold">i</span> on anything to learn what it means.
          </span>
        </div>
      </div>

      <div className="hidden lg:block">
        <ExampleReceipt onOpen={onExample} />
      </div>
    </section>
  );
}
