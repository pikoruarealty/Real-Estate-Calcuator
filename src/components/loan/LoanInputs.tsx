'use client';

import type { CostResult, LoanInput } from '@/engine/types';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { Segmented } from '@/components/ui/Toggle';

export function LoanInputs({ loan, cost, onChange }: { loan: LoanInput; cost: CostResult | null; onChange: (p: Partial<LoanInput>) => void }) {
  return (
    <Card title="Your home loan" subtitle="Change these to match what your bank offers. Defaults are typical values.">
      <div className="space-y-4">
        <NumberInput
          label="Property value for the loan"
          tip="loanValue"
          prefix="₹"
          words
          value={loan.valueOverride}
          onChange={(v) => onChange({ valueOverride: v })}
          min={0}
          placeholder={cost ? new Intl.NumberFormat('en-IN').format(cost.agreementValue) : 'Uses the agreement value'}
          hint={cost ? 'Leave blank to use your agreement value from step 2.' : 'Enter a value, or fill in step 2 (Cost Sheet) first.'}
        />
        <Segmented
          label="How much do you want to borrow?"
          tip="loanMode"
          value={loan.mode}
          onChange={(mode) => onChange({ mode })}
          size="sm"
          options={[
            { value: 'maxEligible', label: 'Maximum' },
            { value: 'percent', label: '% of value' },
            { value: 'amount', label: 'Fixed amount' },
          ]}
          hint={loan.mode === 'maxEligible' ? 'The most banks may lend under RBI rules. Your income also decides what you actually get.' : undefined}
        />
        {loan.mode === 'percent' && <NumberInput label="Loan as % of property value" tip="ltv" suffix="%" value={loan.percent} onChange={(v) => onChange({ percent: v })} min={0} />}
        {loan.mode === 'amount' && <NumberInput label="Loan amount" tip="loanAmount" prefix="₹" words value={loan.amount} onChange={(v) => onChange({ amount: v })} min={0} />}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberInput label="Interest rate (per year)" tip="interestRate" suffix="% p.a." emptyAsZero min={0} value={loan.ratePct} onChange={(v) => onChange({ ratePct: v ?? 0 })} />
          <NumberInput label="Repay over" tip="tenure" suffix="years" emptyAsZero min={1} value={loan.tenureYears} onChange={(v) => onChange({ tenureYears: v ?? 0 })} />
          <NumberInput label="Bank processing fee" tip="processingFee" suffix="% of loan" emptyAsZero min={0} value={loan.processingFeePct} onChange={(v) => onChange({ processingFeePct: v ?? 0 })} />
          <NumberInput label="Your monthly income (optional)" tip="monthlyIncome" prefix="₹" value={loan.monthlyIncome} onChange={(v) => onChange({ monthlyIncome: v })} min={0} />
        </div>
      </div>
    </Card>
  );
}
