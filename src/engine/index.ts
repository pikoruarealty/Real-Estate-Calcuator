import { resolveAreas } from './areas';
import { calculateCost } from './costSheet';
import { calculateLoan } from './loan';
import { buildWarnings } from './warnings';
import type { CalculatorInput, CalculatorResult } from './types';

export function calculate(input: CalculatorInput): CalculatorResult {
  const area = resolveAreas(input.area);
  const { result: cost, warnings } = calculateCost(input.cost, area);
  const loanCalc = calculateLoan(input.loan, cost);
  return {
    area,
    cost,
    loan: loanCalc?.result ?? null,
    warnings: buildWarnings(input, area, cost, loanCalc, warnings),
  };
}

export * from './types';
export * from './config';
export * from './units';
export * from './format';
export { resolveAreas, validateArea } from './areas';
export { calculateCost, rowAmount } from './costSheet';
export { calculateLoan, maxEligibleLoan, emi, ltvSlabPct } from './loan';
export { buildWarnings } from './warnings';
