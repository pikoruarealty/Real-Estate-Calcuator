import { formatAreaNumber, formatINR, formatINRWords, formatPct } from '@/engine/format';
import type { CalculatorInput, CalculatorResult } from '@/engine/types';
import { Card } from '@/components/ui/Card';

/** The result in everyday language, for someone who has never read a cost sheet. */
export function PlainSummary({ input, result }: { input: CalculatorInput; result: CalculatorResult }) {
  const { cost, area, loan } = result;
  if (!cost) return null;
  const extra = cost.allInCost - cost.basePrice;
  const points: React.ReactNode[] = [];

  points.push(
    <>
      The builder’s base price is <b className="text-text">{formatINRWords(cost.basePrice)}</b>. Once floor rise, extra charges, GST, stamp duty and
      registration are added, you’ll pay about <b className="text-gold">{formatINRWords(cost.allInCost)}</b>. That’s{' '}
      <b className="text-text">{formatINRWords(extra)}</b> more{cost.overHeadlinePct != null && <> ({formatPct(cost.overHeadlinePct, 1)})</>}.
    </>,
  );
  points.push(
    <>
      <b className="text-text">{formatINRWords(cost.payableToBuilder)}</b> goes to the builder and{' '}
      <b className="text-text">{formatINRWords(cost.governmentTotal)}</b> goes to the Gujarat government (stamp duty and registration).
    </>,
  );
  if (area.carpetSqft != null && cost.effectiveRatePerCarpetSqft != null) {
    points.push(
      <>
        You can use <b className="text-text">{formatAreaNumber(area.carpetSqft)} sq ft</b>, so each usable sq ft really costs{' '}
        <b className="text-text">{formatINR(cost.effectiveRatePerCarpetSqft)}</b>. Compare this number when looking at other projects.
      </>,
    );
  }
  if (loan && loan.loanAmount > 0) {
    points.push(
      <>
        With a loan of <b className="text-text">{formatINRWords(loan.loanAmount)}</b>, you need about{' '}
        <b className="text-gold">{formatINRWords(loan.upfrontCash)}</b> of your own money, and pay{' '}
        <b className="text-text">{formatINR(loan.emi)} a month</b> for {input.loan.tenureYears} years. See step 3 for details.
      </>,
    );
  }
  return (
    <Card title="In simple words">
      <ul className="space-y-2.5 text-sm leading-relaxed text-text-muted">
        {points.map((p, i) => (
          <li key={i} className="flex gap-2.5">
            <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
