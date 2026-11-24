import { defaultInput, exampleInput } from '@/state/defaults';
import type { CalculatorInput } from '../types';

/** T1 reference (3BHK, under construction) — §12. */
export function t1(): CalculatorInput {
  const i = exampleInput();
  i.cost.projectName = '';
  return i;
}

const clone = (i: CalculatorInput): CalculatorInput => structuredClone(i);

export function t2(): CalculatorInput {
  const i = clone(t1());
  i.cost.buyerType = 'soleWoman';
  return i;
}

export function t3(): CalculatorInput {
  const i = clone(t1());
  i.cost.status = 'ready';
  return i;
}

export function t4(): CalculatorInput {
  const i = clone(t1());
  i.cost.jantriValue = 12_000_000;
  return i;
}

/** T5: carpet 800 + SBU 1080, ₹4,000 on SBU, all add-ons 0, no floor rise. */
export function t5(): CalculatorInput {
  const i = defaultInput();
  i.area = { ...i.area, knownType: 'carpetAndSbu', value: 800, sbuValue: 1080, unit: 'sqft' };
  i.cost = { ...i.cost, baseRate: 4000, rateBasis: 'sbu', floor: 0, frcBaseFloor: 0, frcRatePerFloor: 0 };
  return i;
}

export function t6(): CalculatorInput {
  const i = defaultInput();
  i.area = { ...i.area, knownType: 'sbu', value: 1500, unit: 'sqft', mode: 'kapat', pct: 40 };
  return i;
}

export function t9(): CalculatorInput {
  const i = clone(t1());
  i.cost.agreementValueOverride = 11_000_000;
  return i;
}

export function t10(): CalculatorInput {
  const i = clone(t1());
  i.cost.propertyType = 'commercialOffice';
  i.cost.commercialGst = 12;
  return i;
}
