import { roundForDisplay } from './units';
import type { AreaUnit } from './types';

const inrFmt = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const numFmt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
const smallFmt = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 4 });

export function formatINR(n: number): string {
  return inrFmt.format(Math.round(n));
}

const rateFmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 });

/** Per-unit rates (₹2.5 / sq ft) keep up to 2 decimals; totals use formatINR. */
export function formatRate(n: number): string {
  return rateFmt.format(n);
}

export function formatINRWords(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
  return formatINR(n);
}

/** en-IN grouped number with §6.1 display decimals (no unit suffix). */
export function formatAreaNumber(n: number): string {
  const r = roundForDisplay(n);
  if (Math.abs(r) < 1 && r !== 0) return smallFmt.format(r);
  return numFmt.format(r);
}

export const UNIT_SHORT: Record<AreaUnit, string> = {
  sqft: 'sq ft',
  sqm: 'sq m',
  sqyd: 'sq yd',
  guntha: 'guntha',
  are: 'are',
  acre: 'acre',
  hectare: 'hectare',
  vigha: 'vigha',
  cent: 'cent',
  ground: 'ground',
  marla: 'marla',
  kanal: 'kanal',
};

export function formatArea(n: number, unit: AreaUnit): string {
  return `${formatAreaNumber(n)} ${UNIT_SHORT[unit]}`;
}

/** Percent with up to `dp` decimals, trailing zeros trimmed. */
export function formatPct(n: number, dp = 2): string {
  return `${Number(n.toFixed(dp))}%`;
}
