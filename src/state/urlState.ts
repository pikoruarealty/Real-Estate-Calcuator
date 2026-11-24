import LZString from 'lz-string';
import { z } from 'zod';
import type { CalculatorInput } from '@/engine/types';

const num = z.number().finite();
const nnum = num.nullable();

const unit = z.enum(['sqft', 'sqm', 'sqyd', 'guntha', 'are', 'acre', 'hectare', 'vigha', 'cent', 'ground', 'marla', 'kanal']);
const basis = z.enum(['sbu', 'carpet']);

const addOn = z.object({
  id: z.string().min(1).max(64),
  presetKey: z.enum(['plc', 'parking', 'club', 'devPackage', 'maintDeposit', 'advanceMaint', 'legal']).optional(),
  name: z.string().max(120),
  basis: z.enum(['perSqftSbu', 'perSqftCarpet', 'lumpSum', 'pctOfBase', 'perSqftMonth']),
  amount: num,
  months: num.optional(),
  monthlyAreaBasis: basis.optional(),
  inAgreementValue: z.boolean(),
  gst: z.union([z.literal('auto'), z.literal(0), z.literal(5), z.literal(18)]),
  refundable: z.boolean(),
});

export const inputSchema = z.object({
  v: z.literal(1),
  area: z.object({
    knownType: z.enum(['carpet', 'sbu', 'reraArea', 'carpetAndSbu']),
    value: nnum,
    unit,
    sbuValue: nnum,
    mode: z.enum(['loading', 'kapat']),
    pct: nnum,
    balconySqft: num,
    washSqft: num,
    terraceSqft: num,
    vighaVariant: z.enum(['v17424', 'v21780', 'v16875', 'v23958']),
  }),
  cost: z.object({
    propertyType: z.enum(['flat', 'penthouse', 'commercialOffice', 'shop']),
    baseRate: nnum,
    rateBasis: basis,
    floor: num,
    frcBaseFloor: num,
    frcRatePerFloor: num,
    status: z.enum(['underConstruction', 'ready']),
    buyerType: z.enum(['male', 'soleWoman', 'joint', 'company']),
    commercialGst: z.union([z.literal(5), z.literal(12)]),
    agreementValueOverride: nnum,
    jantriValue: nnum,
    jantriRatePerSqm: nnum,
    jantriAreaSqm: nnum,
    addOns: z.array(addOn).max(40),
    projectName: z.string().max(120),
    overrides: z.object({
      stampDutyPct: num.optional(),
      registrationPct: num.optional(),
      registrationCap: nnum.optional(),
      gstUnderConstructionPct: num.optional(),
    }),
    sellerNri: z.boolean().optional(),
  }),
  loan: z.object({
    valueOverride: nnum,
    mode: z.enum(['maxEligible', 'percent', 'amount']),
    percent: nnum,
    amount: nnum,
    ratePct: num,
    tenureYears: num,
    processingFeePct: num,
    monthlyIncome: nnum,
  }),
});

export function encodeInput(input: CalculatorInput): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(input));
}

export function decodeInput(s: string): CalculatorInput | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(s);
    if (!json) return null;
    const parsed = inputSchema.safeParse(JSON.parse(json));
    return parsed.success ? (parsed.data as CalculatorInput) : null;
  } catch {
    return null;
  }
}

export function shareUrl(input: CalculatorInput, origin: string): string {
  return `${origin.replace(/\/$/, '')}/?s=${encodeInput(input)}`;
}
