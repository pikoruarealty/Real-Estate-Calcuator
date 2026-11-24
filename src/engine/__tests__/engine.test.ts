import { describe, expect, it } from 'vitest';
import { calculate } from '../index';
import { convert } from '../units';
import { emi, maxEligibleLoan } from '../loan';
import { formatINR, formatINRWords } from '../format';
import { resolveAreas, validateArea } from '../areas';
import { defaultInput } from '@/state/defaults';
import { t1, t10, t2, t3, t4, t5, t6, t9 } from './fixtures';

const codes = (r: ReturnType<typeof calculate>) => r.warnings.map((w) => w.code);
const line = (r: ReturnType<typeof calculate>, key: string) => r.cost!.lines.find((l) => l.key === key)!;

describe('T1 reference', () => {
  const r = calculate(t1());
  const c = r.cost!;
  const l = r.loan!;

  it('areas', () => {
    expect(r.area.sbuSqft).toBeCloseTo(1620, 6);
    expect(r.area.kapatPct!).toBeCloseTo(25.926, 3);
  });
  it('agreement value block', () => {
    expect(c.basePrice).toBe(10_530_000);
    expect(c.frc).toBe(162_000);
    expect(line(r, 'plc').amount).toBe(162_000);
    expect(c.agreementValue).toBe(10_854_000);
    expect(c.propertyGstPct).toBe(5);
    expect(c.gstOnAgreementValue).toBe(542_700);
  });
  it('other charges', () => {
    expect(line(r, 'devPackage').amount).toBe(105_000);
    expect(line(r, 'legal').amount).toBe(25_000);
    expect(line(r, 'maintDeposit').amount).toBe(81_000);
    expect(line(r, 'advanceMaint').amount).toBe(97_200);
    expect(line(r, 'advanceMaint').gstAmount).toBe(17_496);
  });
  it('totals', () => {
    expect(c.payableToBuilder).toBe(11_722_396);
    expect(c.stampDuty).toBe(531_846);
    expect(c.registration).toBe(108_540);
    expect(c.allInCost).toBe(12_362_782);
    expect(c.tds).toEqual({ applies: true, base: 10_854_000, amount: 108_540 });
    expect(c.effectiveRatePerCarpetSqft).toBe(10_302);
    expect(c.effectiveRatePerSbuSqft).toBe(7_631);
    expect(Math.abs(c.overHeadlinePct! - 17.4)).toBeLessThanOrEqual(0.01); // spec: 17.40 (±0.01)
  });
  it('loan', () => {
    expect(l.maxEligible).toBe(8_140_500);
    expect(l.loanAmount).toBe(8_140_500);
    expect(l.emi).toBe(68_090);
    expect(l.totalInterest).toBe(8_201_197);
    expect(l.processingFee).toBe(40_703);
    expect(l.upfrontCash).toBe(4_262_985);
  });
  it('warnings', () => {
    expect(codes(r)).toContain('TDS_APPLIES');
  });
  it('amortisation closes to zero and sums to totals', () => {
    const y = l.yearly;
    expect(y).toHaveLength(20);
    expect(y[y.length - 1].closing).toBe(0);
    const p = y.reduce((s, x) => s + x.principal, 0);
    expect(Math.abs(p - l.loanAmount)).toBeLessThanOrEqual(20); // rounding of 20 yearly lines
  });
});

describe('variants', () => {
  it('T2 sole woman', () => {
    const c = calculate(t2()).cost!;
    expect(c.registration).toBe(0);
    expect(c.allInCost).toBe(12_254_242);
  });
  it('T3 ready', () => {
    const c = calculate(t3()).cost!;
    expect(c.gstOnAgreementValue).toBe(0);
    expect(c.allInCost).toBe(11_820_082);
  });
  it('T4 jantri above AV', () => {
    const r = calculate(t4());
    const c = r.cost!;
    expect(c.stampValue).toBe(12_000_000);
    expect(c.stampDuty).toBe(588_000);
    expect(c.registration).toBe(120_000);
    expect(c.allInCost).toBe(12_430_396);
    expect(codes(r)).toContain('JANTRI_ABOVE_AV');
    expect(c.tds.base).toBe(12_000_000);
    expect(c.tds.amount).toBe(120_000);
  });
  it('T5 affordable housing', () => {
    const r = calculate(t5());
    const c = r.cost!;
    expect(c.agreementValue).toBe(4_320_000);
    expect(c.isAffordable).toBe(true);
    expect(c.gstOnAgreementValue).toBe(43_200);
    expect(c.stampDuty).toBe(211_680);
    expect(c.registration).toBe(43_200);
    expect(c.allInCost).toBe(4_618_080);
    expect(4_000 * r.area.sbuSqft! / r.area.carpetSqft!).toBe(5_400);
    expect(c.tds.applies).toBe(false);
    expect(codes(r)).toContain('AFFORDABLE_CLIFF');
  });
  it('T6 area only', () => {
    const a = calculate(t6()).area;
    expect(a.carpetSqft).toBeCloseTo(900, 6);
    expect(a.loadingPct!).toBeCloseTo(66.667, 3);
  });
  it('T9 agreement value override', () => {
    const r = calculate(t9());
    const c = r.cost!;
    expect(c.agreementValue).toBe(11_000_000);
    expect(line(r, 'avAdjustment').amount).toBe(146_000);
    expect(c.gstOnAgreementValue).toBe(550_000);
    expect(c.stampDuty).toBe(539_000);
    expect(c.registration).toBe(110_000);
    expect(codes(r)).toContain('AV_OVERRIDE_DIFF');
  });
  it('T10 commercial office', () => {
    const c = calculate(t10()).cost!;
    expect(c.propertyGstPct).toBe(12);
    expect(c.gstOnAgreementValue).toBe(1_302_480);
  });
});

describe('pure helpers', () => {
  it('T7 maxEligibleLoan', () => {
    expect(maxEligibleLoan(3_600_000)).toBe(3_000_000);
    expect(maxEligibleLoan(9_500_000)).toBe(7_500_000);
  });
  it('T8 vigha conversion', () => {
    expect(convert(1, 'vigha', 'sqft', 'v17424')).toBe(17_424);
    expect(convert(1, 'vigha', 'sqyd', 'v17424')).toBe(1_936);
    expect(convert(1, 'vigha', 'guntha', 'v17424')).toBe(16);
    expect(convert(1, 'vigha', 'acre', 'v17424')).toBeCloseTo(0.4, 10);
  });
  it('T11 zero-rate EMI', () => {
    expect(emi(100_000, 0, 120)).toBeCloseTo(833.33, 2);
  });
  it('T12 formatting', () => {
    expect(formatINR(12_362_782)).toBe('₹1,23,62,782');
    expect(formatINRWords(12_362_782)).toBe('₹1.24 Cr');
    expect(formatINRWords(4_618_080)).toBe('₹46.18 L');
  });
});

describe('robustness', () => {
  it('empty default input never throws and yields no cost/loan', () => {
    const r = calculate(defaultInput());
    expect(r.cost).toBeNull();
    expect(r.loan).toBeNull();
  });
  it('rate on SBU with only carpet and no loading → NEED_SBU', () => {
    const i = defaultInput();
    i.area.value = 1000;
    i.cost.baseRate = 5000;
    const r = calculate(i);
    expect(r.cost).toBeNull();
    expect(codes(r)).toContain('NEED_SBU');
  });
  it('invalid area values yield nulls and field errors', () => {
    const i = defaultInput();
    i.area.value = -5;
    expect(resolveAreas(i.area).carpetSqft).toBeNull();
    expect(validateArea(i.area).value).toBeTruthy();
    i.area = { ...i.area, value: 1000, mode: 'kapat', pct: 75 };
    expect(validateArea(i.area).pct).toBeTruthy();
  });
  it('loan with valueOverride but no cost sheet still computes', () => {
    const i = defaultInput();
    i.loan.valueOverride = 5_000_000;
    const r = calculate(i);
    expect(r.cost).toBeNull();
    expect(r.loan!.upfrontExcludesTaxes).toBe(true);
    expect(r.loan!.loanAmount).toBe(4_000_000); // 80% of ₹50L
  });
  it('loan cap warning', () => {
    const i = t1();
    i.loan = { ...i.loan, mode: 'percent', percent: 90 };
    const r = calculate(i);
    expect(r.loan!.capped).toBe(true);
    expect(codes(r)).toContain('LOAN_CAPPED');
  });
});
