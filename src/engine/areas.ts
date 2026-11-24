import { LIMITS } from './config';
import { sqftPerUnit } from './units';
import type { AreaInput, AreaResult } from './types';

export const EMPTY_AREA: AreaResult = {
  carpetSqft: null,
  sbuSqft: null,
  reraAreaSqft: null,
  commonAreaSqft: null,
  loadingPct: null,
  kapatPct: null,
  efficiencyPct: null,
};

const isNum = (x: number | null | undefined): x is number => typeof x === 'number' && Number.isFinite(x);

export type AreaErrors = Partial<Record<'value' | 'sbuValue' | 'pct', string>>;

/** Field-level validation (UI shows these; the engine just returns nulls). */
export function validateArea(a: AreaInput): AreaErrors {
  const e: AreaErrors = {};
  if (isNum(a.value) && a.value <= 0) e.value = 'Enter an area greater than 0';
  if (a.knownType === 'carpetAndSbu') {
    if (isNum(a.sbuValue) && a.sbuValue <= 0) e.sbuValue = 'Enter an area greater than 0';
    if (isNum(a.value) && isNum(a.sbuValue) && a.sbuValue > 0 && a.value > 0 && a.sbuValue < a.value) {
      e.sbuValue = 'Super built-up cannot be smaller than carpet';
    }
  } else if (isNum(a.pct)) {
    if (a.mode === 'loading' && (a.pct < 0 || a.pct > LIMITS.loadingMaxPct)) {
      e.pct = `Loading must be between 0 and ${LIMITS.loadingMaxPct}%`;
    }
    if (a.mode === 'kapat' && (a.pct < 0 || a.pct >= LIMITS.kapatMaxPct)) {
      e.pct = `Kapat must be between 0 and ${LIMITS.kapatMaxPct}%`;
    }
  }
  if (a.knownType === 'reraArea' && isNum(a.value) && a.value > 0) {
    const C = a.value * sqftPerUnit(a.unit, a.vighaVariant) - extrasOf(a);
    if (C <= 0) e.value = 'RERA area must be larger than balcony + wash + terrace';
  }
  return e;
}

const extrasOf = (a: AreaInput) => (a.balconySqft || 0) + (a.washSqft || 0) + (a.terraceSqft || 0);

export function resolveAreas(a: AreaInput): AreaResult {
  if (!isNum(a.value) || a.value <= 0) return { ...EMPTY_AREA };
  const toSqft = (x: number) => x * sqftPerUnit(a.unit, a.vighaVariant);
  const extras = extrasOf(a);

  let L: number | null = null;
  let K: number | null = null;
  if (a.knownType !== 'carpetAndSbu' && isNum(a.pct) && a.pct >= 0) {
    if (a.mode === 'loading') {
      if (a.pct <= LIMITS.loadingMaxPct) {
        L = a.pct / 100;
        K = L / (1 + L);
      }
    } else if (a.pct < LIMITS.kapatMaxPct) {
      K = a.pct / 100;
      L = K / (1 - K);
    }
  }

  let C: number | null = null;
  let S: number | null = null;
  switch (a.knownType) {
    case 'carpet':
      C = toSqft(a.value);
      S = L != null ? C * (1 + L) : null;
      break;
    case 'sbu':
      S = toSqft(a.value);
      C = K != null ? S * (1 - K) : null;
      break;
    case 'reraArea':
      C = toSqft(a.value) - extras;
      if (C <= 0) return { ...EMPTY_AREA };
      S = L != null ? C * (1 + L) : null;
      break;
    case 'carpetAndSbu': {
      if (!isNum(a.sbuValue) || a.sbuValue <= 0) {
        // carpet alone is still useful
        C = toSqft(a.value);
        break;
      }
      C = toSqft(a.value);
      S = toSqft(a.sbuValue);
      if (S < C) return { ...EMPTY_AREA };
      L = (S - C) / C;
      K = (S - C) / S;
      break;
    }
  }

  return {
    carpetSqft: C,
    sbuSqft: S,
    reraAreaSqft: C != null ? C + extras : null,
    commonAreaSqft: C != null && S != null ? S - C : null,
    loadingPct: C != null && S != null ? ((S - C) / C) * 100 : null,
    kapatPct: C != null && S != null ? ((S - C) / S) * 100 : null,
    efficiencyPct: C != null && S != null ? (C / S) * 100 : null,
  };
}
