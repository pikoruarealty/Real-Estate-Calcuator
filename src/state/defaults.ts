import { LOAN_DEFAULTS, GST } from '@/engine/config';
import type { AddOnRow, CalculatorInput, PresetKey } from '@/engine/types';

interface PresetDef extends Omit<AddOnRow, 'id' | 'amount'> {
  presetKey: PresetKey;
}

export const PRESET_ROWS: PresetDef[] = [
  { presetKey: 'plc', name: 'PLC (preferential location)', basis: 'perSqftSbu', inAgreementValue: true, gst: 'auto', refundable: false },
  { presetKey: 'parking', name: 'Car parking', basis: 'lumpSum', inAgreementValue: true, gst: 'auto', refundable: false },
  { presetKey: 'club', name: 'Club membership', basis: 'lumpSum', inAgreementValue: false, gst: 18, refundable: false },
  {
    presetKey: 'devPackage',
    name: 'Development package (AUDA/AMC, Torrent/UGVCL, water, drainage, gas)',
    basis: 'lumpSum', inAgreementValue: false, gst: 0, refundable: false,
  },
  { presetKey: 'maintDeposit', name: 'Maintenance deposit / corpus', basis: 'perSqftSbu', inAgreementValue: false, gst: 0, refundable: true },
  {
    presetKey: 'advanceMaint',
    name: 'Advance running maintenance',
    basis: 'perSqftMonth', months: 24, monthlyAreaBasis: 'sbu',
    inAgreementValue: false, gst: 18, refundable: false,
  },
  { presetKey: 'legal', name: 'Legal & documentation', basis: 'lumpSum', inAgreementValue: false, gst: 0, refundable: false },
];

export function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function presetRows(): AddOnRow[] {
  // Preset ids are stable (derived from the key) so shared URLs stay small and diff-friendly.
  return PRESET_ROWS.map((p) => ({ ...p, id: p.presetKey, amount: 0 }));
}

export function defaultInput(): CalculatorInput {
  return {
    v: 1,
    area: {
      knownType: 'carpet',
      value: null,
      unit: 'sqft',
      sbuValue: null,
      mode: 'loading',
      pct: null,
      balconySqft: 0,
      washSqft: 0,
      terraceSqft: 0,
      vighaVariant: 'v17424',
    },
    cost: {
      propertyType: 'flat',
      baseRate: null,
      rateBasis: 'sbu',
      floor: 0,
      frcBaseFloor: 0,
      frcRatePerFloor: 0,
      status: 'underConstruction',
      buyerType: 'male',
      commercialGst: GST.commercialDefaultPct as 12,
      agreementValueOverride: null,
      jantriValue: null,
      jantriRatePerSqm: null,
      jantriAreaSqm: null,
      addOns: presetRows(),
      projectName: '',
      overrides: {},
      sellerNri: false,
    },
    loan: {
      valueOverride: null,
      mode: 'maxEligible',
      percent: null,
      amount: null,
      ratePct: LOAN_DEFAULTS.ratePct,
      tenureYears: LOAN_DEFAULTS.tenureYears,
      processingFeePct: LOAN_DEFAULTS.processingFeePct,
      monthlyIncome: null,
    },
  };
}

/** Fixture T1 (§12): 3BHK, under construction, Ahmedabad. Used by the "Example" button. */
export function exampleInput(): CalculatorInput {
  const d = defaultInput();
  d.area = { ...d.area, knownType: 'carpet', value: 1200, unit: 'sqft', mode: 'loading', pct: 35 };
  d.cost = {
    ...d.cost,
    baseRate: 6500,
    rateBasis: 'sbu',
    floor: 8,
    frcBaseFloor: 4,
    frcRatePerFloor: 25,
    projectName: 'Example 3BHK',
    addOns: d.cost.addOns.map((r) => {
      switch (r.presetKey) {
        case 'plc': return { ...r, amount: 100 };
        case 'devPackage': return { ...r, amount: 105000 };
        case 'legal': return { ...r, amount: 25000 };
        case 'maintDeposit': return { ...r, amount: 50 };
        case 'advanceMaint': return { ...r, amount: 2.5, months: 24 };
        default: return r;
      }
    }),
  };
  return d;
}
