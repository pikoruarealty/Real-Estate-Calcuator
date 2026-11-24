import { GST, REGISTRATION_CAP, REGISTRATION_PCT, SQFT_PER_SQM, STAMP_DUTY_PCT, TDS } from './config';
import { formatAreaNumber, formatINR, formatPct, formatRate } from './format';
import type {
  AddOnRow, AreaResult, CostInput, CostLine, CostResult, Warning,
} from './types';

const isNum = (x: number | null | undefined): x is number => typeof x === 'number' && Number.isFinite(x);
const round = Math.round;

/** Raw (unrounded) amount of an add-on row, or null if a required area is missing. */
export function rowAmount(row: AddOnRow, C: number | null, S: number | null, basePrice: number): number | null {
  const amt = isNum(row.amount) ? row.amount : 0;
  switch (row.basis) {
    case 'perSqftSbu':
      return S == null ? null : amt * S;
    case 'perSqftCarpet':
      return C == null ? null : amt * C;
    case 'lumpSum':
      return amt;
    case 'pctOfBase':
      return (amt / 100) * basePrice;
    case 'perSqftMonth': {
      const area = row.monthlyAreaBasis === 'carpet' ? C : S;
      return area == null ? null : amt * area * (row.months ?? 0);
    }
  }
}

function rowCalc(row: AddOnRow, C: number | null, S: number | null): string {
  const a = formatRate(row.amount);
  switch (row.basis) {
    case 'perSqftSbu':
      return `${formatAreaNumber(S ?? 0)} sq ft × ${a}`;
    case 'perSqftCarpet':
      return `${formatAreaNumber(C ?? 0)} sq ft × ${a}`;
    case 'lumpSum':
      return 'Lump sum';
    case 'pctOfBase':
      return `${formatPct(row.amount)} of base price`;
    case 'perSqftMonth': {
      const carpet = row.monthlyAreaBasis === 'carpet';
      return `${formatAreaNumber((carpet ? C : S) ?? 0)} sq ft × ${a} × ${row.months ?? 0} months`;
    }
  }
}

export function calculateCost(
  c: CostInput,
  area: AreaResult,
): { result: CostResult | null; warnings: Warning[] } {
  const warnings: Warning[] = [];
  const needArea = (code: 'NEED_SBU' | 'NEED_CARPET') => {
    if (!warnings.some((w) => w.code === code)) warnings.push({ code });
  };

  const C = area.carpetSqft;
  const S = area.sbuSqft;
  const billingArea = c.rateBasis === 'sbu' ? S : C;
  if (!isNum(c.baseRate) || c.baseRate <= 0) return { result: null, warnings };
  if (billingArea == null) {
    needArea(c.rateBasis === 'sbu' ? 'NEED_SBU' : 'NEED_CARPET');
    return { result: null, warnings };
  }

  const lines: CostLine[] = [];
  const basisLabel = c.rateBasis === 'sbu' ? 'super built-up' : 'carpet';

  // 2. base price
  const basePrice = round(billingArea * c.baseRate);
  lines.push({
    key: 'base',
    label: `Base price (${basisLabel} rate)`,
    calc: `${formatAreaNumber(billingArea)} sq ft × ${formatRate(c.baseRate)}`,
    amount: basePrice,
    block: 'A',
  });

  // 3. floor rise charge
  const floorsAbove = Math.max(0, (c.floor || 0) - (c.frcBaseFloor || 0));
  const frc = round(billingArea * (c.frcRatePerFloor || 0) * floorsAbove);
  if (frc !== 0) {
    lines.push({
      key: 'frc',
      label: 'Floor rise charge (FRC)',
      calc: `${formatAreaNumber(billingArea)} sq ft × ${formatRate(c.frcRatePerFloor)} × ${floorsAbove} floors`,
      amount: frc,
      block: 'A',
    });
  }

  // 4. add-ons
  type Resolved = { row: AddOnRow; amount: number };
  const resolved: Resolved[] = [];
  for (const row of c.addOns) {
    const raw = rowAmount(row, C, S, basePrice);
    if (raw == null) {
      if (row.amount > 0) {
        const needsCarpet =
          row.basis === 'perSqftCarpet' || (row.basis === 'perSqftMonth' && row.monthlyAreaBasis === 'carpet');
        needArea(needsCarpet ? 'NEED_CARPET' : 'NEED_SBU');
      }
      continue;
    }
    const amount = round(raw);
    if (amount === 0) continue; // rows with amount 0 are omitted
    resolved.push({ row, amount });
  }
  const avRows = resolved.filter((r) => r.row.inAgreementValue);
  const otherRows = resolved.filter((r) => !r.row.inAgreementValue);

  // 5. computed AV
  const computedAV = basePrice + frc + avRows.reduce((s, r) => s + r.amount, 0);

  // 6. AV override
  const hasOverride = isNum(c.agreementValueOverride) && c.agreementValueOverride > 0;
  const AV = hasOverride ? round(c.agreementValueOverride as number) : computedAV;

  // 7. property GST %
  let propertyGstPct: number;
  let isAffordable = false;
  const isCommercial = c.propertyType === 'commercialOffice' || c.propertyType === 'shop';
  if (c.status === 'ready') {
    propertyGstPct = GST.readyPct;
  } else if (isCommercial) {
    propertyGstPct = c.commercialGst;
  } else if (C != null && C / SQFT_PER_SQM <= GST.affordableMaxCarpetSqm && AV <= GST.affordableMaxValue) {
    propertyGstPct = GST.affordablePct;
    isAffordable = true;
  } else {
    propertyGstPct = c.overrides.gstUnderConstructionPct ?? GST.underConstructionPct;
  }

  // 8. GST on AV
  const gstOnAV = round((AV * propertyGstPct) / 100);

  // Block A lines: in-AV rows, adjustment, GST
  for (const { row, amount } of avRows) {
    lines.push({
      key: row.id,
      label: row.name,
      calc: rowCalc(row, C, S),
      amount,
      block: 'A',
      refundable: row.refundable || undefined,
    });
  }
  if (hasOverride && AV - computedAV !== 0) {
    lines.push({
      key: 'avAdjustment',
      label: 'Adjustment to agreement value (as per your agreement)',
      calc: `${formatINR(AV)} − ${formatINR(computedAV)}`,
      amount: AV - computedAV,
      block: 'A',
    });
  }
  lines.push({
    key: 'gstAv',
    label: 'GST on agreement value',
    calc: `${formatPct(propertyGstPct)} of ${formatINR(AV)}`,
    amount: gstOnAV,
    gstPct: propertyGstPct,
    block: 'A',
  });

  // 9. Block B: non-AV rows with GST
  let otherChargesTotal = 0;
  let otherChargesGst = 0;
  for (const { row, amount } of otherRows) {
    const rowGstPct = row.gst === 'auto' ? propertyGstPct : row.gst;
    const rowGst = round((amount * rowGstPct) / 100);
    otherChargesTotal += amount;
    otherChargesGst += rowGst;
    lines.push({
      key: row.id,
      label: row.name,
      calc: rowCalc(row, C, S),
      amount,
      gstPct: rowGstPct,
      gstAmount: rowGst,
      block: 'B',
      refundable: row.refundable || undefined,
    });
  }

  // 10. payable to builder
  const payableToBuilder = AV + gstOnAV + otherChargesTotal + otherChargesGst;

  // 11. Jantri
  let jantriValue: number | null = null;
  if (isNum(c.jantriValue) && c.jantriValue > 0) {
    jantriValue = round(c.jantriValue);
  } else if (isNum(c.jantriRatePerSqm) && c.jantriRatePerSqm > 0) {
    const sqm = isNum(c.jantriAreaSqm) && c.jantriAreaSqm > 0 ? c.jantriAreaSqm : C != null ? C / SQFT_PER_SQM : null;
    if (sqm != null) jantriValue = round(c.jantriRatePerSqm * sqm);
  }

  // 12-14. stamp duty & registration
  const stampValue = Math.max(AV, jantriValue ?? 0);
  const stampPct = c.overrides.stampDutyPct ?? STAMP_DUTY_PCT;
  const stampDuty = round((stampValue * stampPct) / 100);
  const regPct = c.overrides.registrationPct ?? REGISTRATION_PCT;
  let registration = c.buyerType === 'soleWoman' ? 0 : round((stampValue * regPct) / 100);
  const cap = c.overrides.registrationCap ?? REGISTRATION_CAP;
  if (cap != null && registration > cap) registration = cap;

  lines.push({
    key: 'stampDuty',
    label: 'Stamp duty',
    calc: `${formatPct(stampPct)} of ${formatINR(stampValue)}`,
    amount: stampDuty,
    block: 'C',
  });
  lines.push({
    key: 'registration',
    label: 'Registration fee',
    calc:
      c.buyerType === 'soleWoman'
        ? 'Waived for a sole woman buyer'
        : `${formatPct(regPct)} of ${formatINR(stampValue)}${cap != null ? ` (cap ${formatINR(cap)})` : ''}`,
    amount: registration,
    block: 'C',
  });

  // 15. all-in
  const governmentTotal = stampDuty + registration;
  const allInCost = payableToBuilder + governmentTotal;

  // 16. TDS (info only)
  const tdsBase = Math.max(AV, stampValue);
  const tdsApplies = tdsBase >= TDS.threshold;
  const tds = { applies: tdsApplies, base: tdsBase, amount: tdsApplies ? round((tdsBase * TDS.pct) / 100) : 0 };

  // 17. effective rates
  const result: CostResult = {
    lines,
    basePrice,
    frc,
    computedAgreementValue: computedAV,
    agreementValue: AV,
    propertyGstPct,
    isAffordable,
    gstOnAgreementValue: gstOnAV,
    otherChargesTotal,
    otherChargesGst,
    payableToBuilder,
    jantriValue,
    stampValue,
    stampDuty,
    registration,
    governmentTotal,
    allInCost,
    tds,
    effectiveRatePerCarpetSqft: C != null ? round(allInCost / C) : null,
    effectiveRatePerSbuSqft: S != null ? round(allInCost / S) : null,
    overHeadlinePct: basePrice > 0 ? (allInCost / basePrice - 1) * 100 : null,
  };
  return { result, warnings };
}
