import type { AreaUnit } from './types';

export const RATES_UPDATED_ON = '2026-11-24';

export const SQFT_PER_SQM = 10.763910416709722; // 1 / 0.09290304

export const SQFT_PER_UNIT = {
  sqft: 1,
  sqm: SQFT_PER_SQM,
  sqyd: 9, // vaar / gaj
  guntha: 1089,
  are: 100 * SQFT_PER_SQM,
  acre: 43560,
  hectare: 10000 * SQFT_PER_SQM,
  cent: 435.6,
  ground: 2400,
  marla: 272.25,
  kanal: 5445,
  // vigha resolved via VIGHA_VARIANTS
} as const;

export const VIGHA_VARIANTS = {
  v17424: { sqft: 17424, label: '16 guntha' }, // default
  v21780: { sqft: 21780, label: '20 guntha' },
  v16875: { sqft: 16875, label: '15.5 guntha' },
  v23958: { sqft: 23958, label: '22 guntha' },
} as const;

export const REGIONAL_UNITS_BASE: AreaUnit[] = ['sqft', 'sqm', 'sqyd', 'guntha', 'are', 'acre', 'hectare', 'vigha'];
export const OTHER_STATE_UNITS: AreaUnit[] = ['cent', 'ground', 'marla', 'kanal'];

export const UNIT_LABELS: Record<AreaUnit, string> = {
  sqft: 'Sq ft',
  sqm: 'Sq m',
  sqyd: 'Sq yd (vaar / gaj)',
  guntha: 'Guntha',
  are: 'Are',
  acre: 'Acre',
  hectare: 'Hectare',
  vigha: 'Vigha / bigha',
  cent: 'Cent',
  ground: 'Ground',
  marla: 'Marla',
  kanal: 'Kanal',
};

export const GST = {
  underConstructionPct: 5,
  affordablePct: 1,
  readyPct: 0,
  affordableMaxCarpetSqm: 90, // non-metro; inclusive
  affordableMaxValue: 4_500_000, // inclusive
  commercialDefaultPct: 12, // TODO(spec): verify vs GST 2.0 before launch
  servicesPct: 18,
  maintenanceExemptPerMonth: 7_500,
} as const;

export const STAMP_DUTY_PCT = 4.9;
export const REGISTRATION_PCT = 1;
export const REGISTRATION_CAP: number | null = null;

export const TDS = { pct: 1, threshold: 5_000_000 } as const;

// RBI LTV slabs: loan <= 30L -> 90%, 30L-75L -> 80%, > 75L -> 75%
export const LTV_SLABS = [
  { maxLoan: 3_000_000, ltv: 0.9 },
  { maxLoan: 7_500_000, ltv: 0.8 },
  { maxLoan: Infinity, ltv: 0.75 },
] as const;

export const LOAN_DEFAULTS = { ratePct: 8.0, tenureYears: 20, processingFeePct: 0.5 } as const;

export const WARN = {
  affordableCliffBandPct: 5, // AV within 5% of 45L
  highLoadingPct: 50,
  highKapatPct: 33,
  avOverrideDiffPct: 1,
  emiIncomeHighPct: 50,
} as const;

/** Input validation bounds (§6.2). */
export const LIMITS = {
  loadingMaxPct: 150,
  kapatMaxPct: 60,
} as const;
