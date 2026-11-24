import { formatAreaNumber, formatINR, formatINRWords } from '@/engine/format';
import type { CalculatorInput, CalculatorResult } from '@/engine/types';

/** Three short lines, like a friend explaining the numbers. */
export function PlainSummary({ input, result }: { input: CalculatorInput; result: CalculatorResult }) {
  const { cost, area, loan } = result;
  if (!cost) return null;
  const lines: { icon: string; text: React.ReactNode }[] = [
    {
      icon: '🏷️',
      text: (
        <>The quote says <b className="text-text">{formatINRWords(cost.basePrice)}</b>. Charges and taxes add <b className="text-text">{formatINRWords(cost.allInCost - cost.basePrice)}</b> on top.</>
      ),
    },
    {
      icon: '🏛️',
      text: (
        <><b className="text-text">{formatINRWords(cost.payableToBuilder)}</b> goes to the builder, <b className="text-text">{formatINRWords(cost.governmentTotal)}</b> to the government.</>
      ),
    },
  ];
  if (loan && loan.loanAmount > 0) {
    lines.push({
      icon: '💰',
      text: (
        <>Keep <b className="text-gold">{formatINRWords(loan.upfrontCash)}</b> ready yourself. The bank covers the rest at <b className="text-text">{formatINR(loan.emi)}/month</b> for {input.loan.tenureYears} years.</>
      ),
    });
  } else if (area.carpetSqft != null && cost.effectiveRatePerCarpetSqft != null) {
    lines.push({
      icon: '📏',
      text: <>Across {formatAreaNumber(area.carpetSqft)} sq ft you can use, that’s <b className="text-text">{formatINR(cost.effectiveRatePerCarpetSqft)}</b> per sq ft.</>,
    });
  }
  return (
    <section className="rounded-3xl bg-surface p-5 sm:p-6">
      <h2 className="mb-4 text-[17px] font-semibold tracking-tight">In short</h2>
      <ul className="space-y-3.5">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-text-muted">
            <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-sm">{l.icon}</span>
            <span className="pt-1">{l.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
