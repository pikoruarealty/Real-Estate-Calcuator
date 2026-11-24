import { RATES_UPDATED_ON } from '@/engine/config';
import { formatINR, formatINRWords } from '@/engine/format';
import type { CalculatorResult, LoanInput, Warning, WarningCode } from '@/engine/types';

export const DISCLAIMER = `Figures are indicative estimates based on the values you entered and Gujarat rates as of ${RATES_UPDATED_ON}. Builder charges (PLC, FRC, deposits, maintenance, development and other charges) vary by project and are not regulated amounts. Stamp duty is charged on the higher of agreement value and Jantri value. GST, stamp duty and loan terms may change. Confirm every amount with the developer, your lender and a legal or tax advisor before you pay. This is not legal, tax or financial advice.`;

export const LOAN_NOTE = 'Rates and eligibility are set by your lender. This is an estimate.';

type Params = NonNullable<Warning['params']>;
const money = (v: string | number | undefined) => formatINR(Number(v ?? 0));
const num = (v: string | number | undefined) => String(v ?? '');

const TEXT: Record<WarningCode, (p: Params) => string> = {
  AFFORDABLE_CLIFF: () => 'Your agreement value is close to ₹45 lakh. Above ₹45 lakh, GST rises from 1% to 5%.',
  JANTRI_ABOVE_AV: (p) =>
    `Jantri value (${money(p.jantri)}) is higher than your agreement value, so stamp duty and registration are charged on Jantri.`,
  TDS_APPLIES: (p) =>
    `Price is ₹50 lakh or more: deduct 1% TDS (${money(p.amount)}) from your payment to the builder and file Form 26QB. This is not an extra cost.`,
  HIGH_LOADING: (p) =>
    `High loading (${num(p.loading)}% / kapat ${num(p.kapat)}%). Compare projects on the carpet rate, not the SBU rate.`,
  AV_OVERRIDE_DIFF: (p) =>
    `Your agreement value (${money(p.override)}) differs from the calculated value (${money(p.computed)}). Taxes use your agreement value.`,
  MAINT_GST: (p) =>
    `Monthly maintenance (${money(p.monthly)}) is above ₹7,500, so the society bill will attract 18% GST on the full amount.`,
  LOAN_CAPPED: (p) =>
    `Loan capped at ${money(p.max)}: RBI allows up to ${num(p.ltv)}% of the property value for this loan size.`,
  EMI_INCOME_HIGH: (p) => `EMI is ${num(p.pct)}% of your income. Banks usually keep EMIs under about half of income.`,
  VIGHA_VARIES: () => 'Vigha size differs by region. For legal use, rely on guntha or sq m from the 7/12 record.',
  NEED_SBU: () => 'Enter loading/kapat or the super built-up area to use SBU-based rates.',
  NEED_CARPET: () => 'Enter the carpet area to use carpet-based rates.',
  SELLER_NRI: () => 'Buying from an NRI seller needs higher TDS on capital gains and a TAN. Talk to our advisor.',
};

export function warningText(w: Warning): string {
  return TEXT[w.code](w.params ?? {});
}

/** Warnings that should offer an inline "Talk to our advisor" CTA (§10). */
export const ADVISOR_WARNINGS: WarningCode[] = ['SELLER_NRI', 'AV_OVERRIDE_DIFF'];

/** Severity styling: informational vs caution. */
export const INFO_WARNINGS: WarningCode[] = ['TDS_APPLIES', 'VIGHA_VARIES', 'NEED_SBU', 'NEED_CARPET'];

export function whatsappSummary(opts: {
  projectName: string;
  result: CalculatorResult;
  loan: LoanInput;
  shareUrl: string;
}): string {
  const { projectName, result, loan, shareUrl } = opts;
  const { area, cost, loan: l } = result;
  const lines: string[] = [];
  lines.push(`${projectName.trim() || 'Property'} — cost estimate`);
  const a: string[] = [];
  if (area.carpetSqft != null) a.push(`Carpet ${Math.round(area.carpetSqft).toLocaleString('en-IN')} sq ft`);
  if (area.sbuSqft != null) a.push(`SBU ${Math.round(area.sbuSqft).toLocaleString('en-IN')} sq ft`);
  if (a.length) lines.push(a.join(' · '));
  if (cost) {
    lines.push(`All-in cost: ${formatINR(cost.allInCost)} (${formatINRWords(cost.allInCost)})`);
    if (cost.effectiveRatePerCarpetSqft != null) {
      lines.push(`Effective: ${formatINR(cost.effectiveRatePerCarpetSqft)}/sq ft carpet`);
    }
  }
  if (l && l.loanAmount > 0) lines.push(`EMI: ${formatINR(l.emi)}/month (${loan.tenureYears} yrs @ ${loan.ratePct}%)`);
  lines.push(`Full breakup: ${shareUrl}`);
  return lines.join('\n');
}
