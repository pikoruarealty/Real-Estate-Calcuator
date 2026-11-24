import type { CostLine, CostResult } from '@/engine/types';

export interface SheetSection {
  rows: CostLine[];
  amount: number;
  gst: number;
  total: number;
}

export interface Sheet {
  a: SheetSection; // agreement value + GST
  b: SheetSection; // other builder charges
  c: SheetSection; // government
  payableToBuilder: number;
  allIn: number;
}

/** Shape a CostResult into the A / B / C blocks shown in the table and PDF. */
export function buildSheet(cost: CostResult): Sheet {
  const rows = (blk: 'A' | 'B' | 'C') => cost.lines.filter((l) => l.block === blk && l.key !== 'gstAv');
  const a: SheetSection = {
    rows: rows('A'),
    amount: cost.agreementValue,
    gst: cost.gstOnAgreementValue,
    total: cost.agreementValue + cost.gstOnAgreementValue,
  };
  const b: SheetSection = {
    rows: rows('B'),
    amount: cost.otherChargesTotal,
    gst: cost.otherChargesGst,
    total: cost.otherChargesTotal + cost.otherChargesGst,
  };
  const c: SheetSection = { rows: rows('C'), amount: cost.governmentTotal, gst: 0, total: cost.governmentTotal };
  return { a, b, c, payableToBuilder: cost.payableToBuilder, allIn: cost.allInCost };
}
