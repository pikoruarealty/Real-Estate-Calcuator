import { GST, SQFT_PER_SQM, WARN } from './config';
import type { AreaResult, CalculatorInput, CostResult, LoanResult, Warning } from './types';
import { rowAmount } from './costSheet';

export function buildWarnings(
  input: CalculatorInput,
  area: AreaResult,
  cost: CostResult | null,
  loan: { result: LoanResult; requested: number; slabLtvPct: number } | null,
  upstream: Warning[],
): Warning[] {
  const out: Warning[] = [...upstream];
  const push = (w: Warning) => {
    if (!out.some((x) => x.code === w.code)) out.push(w);
  };

  const c = input.cost;
  const C = area.carpetSqft;

  if (cost) {
    const residential = c.propertyType === 'flat' || c.propertyType === 'penthouse';
    if (
      c.status === 'underConstruction' && residential && C != null &&
      C / SQFT_PER_SQM <= GST.affordableMaxCarpetSqm &&
      cost.agreementValue >= GST.affordableMaxValue * (1 - WARN.affordableCliffBandPct / 100) &&
      cost.agreementValue <= GST.affordableMaxValue * (1 + WARN.affordableCliffBandPct / 100)
    ) push({ code: 'AFFORDABLE_CLIFF', params: { av: cost.agreementValue } });

    if (cost.jantriValue != null && cost.jantriValue > cost.agreementValue) {
      push({ code: 'JANTRI_ABOVE_AV', params: { jantri: cost.jantriValue, av: cost.agreementValue } });
    }
    if (cost.tds.applies) push({ code: 'TDS_APPLIES', params: { amount: cost.tds.amount } });

    if (
      c.agreementValueOverride != null && c.agreementValueOverride > 0 && cost.computedAgreementValue > 0 &&
      (Math.abs(c.agreementValueOverride - cost.computedAgreementValue) / cost.computedAgreementValue) * 100 >
        WARN.avOverrideDiffPct
    ) push({ code: 'AV_OVERRIDE_DIFF', params: { override: cost.agreementValue, computed: cost.computedAgreementValue } });

    // Society maintenance above ₹7,500/month attracts 18% GST on the full amount.
    for (const row of c.addOns) {
      if (row.basis !== 'perSqftMonth' || !(row.amount > 0)) continue;
      const monthly = rowAmount({ ...row, months: 1 }, area.carpetSqft, area.sbuSqft, cost.basePrice);
      if (monthly != null && monthly > GST.maintenanceExemptPerMonth) {
        push({ code: 'MAINT_GST', params: { monthly: Math.round(monthly) } });
      }
    }
  }

  if (
    (area.loadingPct != null && area.loadingPct > WARN.highLoadingPct) ||
    (area.kapatPct != null && area.kapatPct > WARN.highKapatPct)
  ) {
    push({
      code: 'HIGH_LOADING',
      params: {
        loading: Number((area.loadingPct ?? 0).toFixed(1)),
        kapat: Number((area.kapatPct ?? 0).toFixed(1)),
      },
    });
  }

  if (loan) {
    if (loan.result.capped) {
      push({ code: 'LOAN_CAPPED', params: { max: loan.result.maxEligible, ltv: loan.slabLtvPct } });
    }
    if (loan.result.emiToIncomePct != null && loan.result.emiToIncomePct > WARN.emiIncomeHighPct) {
      push({ code: 'EMI_INCOME_HIGH', params: { pct: Math.round(loan.result.emiToIncomePct) } });
    }
  }

  if (input.area.unit === 'vigha') push({ code: 'VIGHA_VARIES' });
  if (c.sellerNri) push({ code: 'SELLER_NRI' });

  return out;
}
