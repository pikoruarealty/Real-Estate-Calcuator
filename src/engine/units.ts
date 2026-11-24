import { SQFT_PER_UNIT, VIGHA_VARIANTS } from './config';
import type { AreaUnit, VighaVariant } from './types';

export const ALL_UNITS: AreaUnit[] = [
  'sqft', 'sqm', 'sqyd', 'guntha', 'are', 'acre', 'hectare', 'vigha', 'cent', 'ground', 'marla', 'kanal',
];

export function sqftPerUnit(unit: AreaUnit, vigha: VighaVariant): number {
  if (unit === 'vigha') return VIGHA_VARIANTS[vigha].sqft;
  return SQFT_PER_UNIT[unit];
}

/** value * sqftPerUnit(from) / sqftPerUnit(to) — no rounding. */
export function convert(value: number, from: AreaUnit, to: AreaUnit, vigha: VighaVariant): number {
  return (value * sqftPerUnit(from, vigha)) / sqftPerUnit(to, vigha);
}

export function convertToAll(value: number, from: AreaUnit, vigha: VighaVariant): Record<AreaUnit, number> {
  const out = {} as Record<AreaUnit, number>;
  for (const u of ALL_UNITS) out[u] = convert(value, from, u, vigha);
  return out;
}

/** Display rounding: >= 1000 → 0 dp; >= 1 → 2 dp; < 1 → 4 significant digits. */
export function roundForDisplay(n: number): number {
  const abs = Math.abs(n);
  if (abs >= 1000) return Math.round(n);
  if (abs >= 1) return Math.round(n * 100) / 100;
  if (abs === 0) return 0;
  return Number(n.toPrecision(4));
}

export type LengthUnit = 'ft' | 'm' | 'yd';

/** Length × width → sqft. 1 ft = 0.3048 m, 1 yd = 3 ft. */
export function lengthToArea(l: number, w: number, unit: LengthUnit): number {
  const ftPer = unit === 'ft' ? 1 : unit === 'yd' ? 3 : 1 / 0.3048;
  return l * ftPer * (w * ftPer);
}
