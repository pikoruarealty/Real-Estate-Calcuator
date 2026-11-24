'use client';

import { BRAND } from '@/config/brand';
import { useApp } from '@/state/CalculatorContext';
import { Button } from '@/components/ui/Button';

/** Short, friendly intro. The tagline's word "real" is highlighted. */
export function Hero({ onExample }: { onExample: () => void }) {
  const { reset, result } = useApp();
  const started = result.area.carpetSqft != null || result.area.sbuSqft != null || result.cost != null;
  const parts = BRAND.tagline.split(/(real)/i);
  return (
    <section className="pb-6 pt-8 sm:pb-10 sm:pt-16">
      <h1 className="max-w-3xl text-[30px] font-semibold leading-[1.1] tracking-tight text-text sm:text-6xl">
        {parts.map((p, i) => (/^real$/i.test(p) ? <span key={i} className="text-gold">{p}</span> : p))}
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-text-muted sm:mt-4 sm:text-lg">
        The rate a builder quotes is just the start. Tell us the size and price, and we’ll add every charge and tax and work out your EMI.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-3 sm:mt-7">
        <Button onClick={onExample}>Try an example</Button>
        {started && <Button variant="ghost" onClick={reset}>Start over</Button>}
        <span className="ml-1 text-[13px] text-text-muted">
          Tap <span aria-hidden className="mx-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/[0.07] text-[10px] font-semibold align-[-2px]">i</span> on anything to learn what it means.
        </span>
      </div>
    </section>
  );
}
