import { LTV_SLABS } from './config';
import type { CostResult, LoanInput, LoanResult } from './types';

const isNum = (x: number | null | undefined): x is number => typeof x === 'number' && Number.isFinite(x);

export function maxEligibleLoan(V: number): number {
  return Math.max(Math.min(0.9 * V, 3_000_000), Math.min(0.8 * V, 7_500_000), 0.75 * V);
}

/** The RBI LTV slab (in %) that yields the maximum loan for property value V. */
export function ltvSlabPct(V: number): number {
  const candidates = LTV_SLABS.map((s) => ({ ltv: s.ltv, loan: Math.min(s.ltv * V, s.maxLoan) }));
  let best = candidates[0];
  for (const c of candidates) if (c.loan > best.loan) best = c;
  return Math.round(best.ltv * 100);
}

export function emi(P: number, annualPct: number, months: number): number {
  const r = annualPct / 12 / 100;
  if (months <= 0) return 0;
  if (r === 0) return P / months;
  const f = Math.pow(1 + r, months);
  return (P * r * f) / (f - 1);
}

export interface LoanCalc {
  result: LoanResult;
  requested: number;
  slabLtvPct: number;
}

export function calculateLoan(l: LoanInput, cost: CostResult | null): LoanCalc | null {
  const V = isNum(l.valueOverride) && l.valueOverride > 0 ? l.valueOverride : cost?.agreementValue ?? null;
  if (V == null || V <= 0) return null;
  if (!isNum(l.tenureYears) || l.tenureYears <= 0) return null;

  const max = maxEligibleLoan(V);
  let requested: number;
  if (l.mode === 'percent') requested = isNum(l.percent) ? (V * l.percent) / 100 : 0;
  else if (l.mode === 'amount') requested = isNum(l.amount) ? l.amount : 0;
  else requested = max;
  requested = Math.max(0, requested);

  const P = Math.min(requested, max);
  const capped = requested > max;
  const n = Math.round(l.tenureYears * 12);
  const rate = isNum(l.ratePct) ? Math.max(0, l.ratePct) : 0;
  const emiRaw = emi(P, rate, n);
  const totalInterest = Math.round(emiRaw * n - P);
  const processingFee = Math.round((P * (l.processingFeePct || 0)) / 100);
  const base = cost ? cost.allInCost : V;

  // Amortisation with unrounded values, aggregated per year.
  const r = rate / 12 / 100;
  const yearly: LoanResult['yearly'] = [];
  let bal = P;
  let opening = P;
  let yp = 0;
  let yi = 0;
  for (let m = 1; m <= n; m++) {
    const interest = bal * r;
    const principal = emiRaw - interest;
    bal -= principal;
    yp += principal;
    yi += interest;
    if (m % 12 === 0 || m === n) {
      const closing = Math.abs(bal) < 0.5 ? 0 : bal;
      yearly.push({
        year: Math.ceil(m / 12),
        opening: Math.round(opening),
        principal: Math.round(yp),
        interest: Math.round(yi),
        closing: Math.round(closing),
      });
      opening = bal;
      yp = 0;
      yi = 0;
    }
  }

  return {
    requested,
    slabLtvPct: ltvSlabPct(V),
    result: {
      propertyValue: V,
      maxEligible: Math.round(max),
      loanAmount: Math.round(P),
      ltvUsedPct: (P / V) * 100,
      capped,
      emi: Math.round(emiRaw),
      totalInterest,
      totalRepayment: Math.round(P) + totalInterest,
      processingFee,
      upfrontCash: Math.round(base - P + processingFee),
      upfrontExcludesTaxes: cost ? undefined : true,
      emiToIncomePct: isNum(l.monthlyIncome) && l.monthlyIncome > 0 ? (emiRaw / l.monthlyIncome) * 100 : null,
      yearly,
    },
  };
}
