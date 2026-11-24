'use client';

import type { CostResult, LoanInput } from '@/engine/types';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { Segmented } from '@/components/ui/Toggle';

export function LoanInputs({ loan, cost, onChange }: { loan: LoanInput; cost: CostResult | null; onChange: (p: Partial<LoanInput>) => void }) {
  return (
    <Card title="Your home loan" subtitle="We’ve filled in typical values. Change them to match your bank.">
      <div className="space-y-5">
        <NumberInput
          label="Property value for the loan"
          tip="loanValue"
          prefix="₹"
          words
          value={loan.valueOverride}
          onChange={(v) => onChange({ valueOverride: v })}
          min={0}
          placeholder={cost ? new Intl.NumberFormat('en-IN').format(cost.agreementValue) : 'Uses the agreement value'}
          hint={cost ? 'Blank = your agreement value from step 2.' : 'Or fill in step 2 first.'}
        />
        <Segmented
          label="How much to borrow"
          tip="loanMode"
          value={loan.mode}
          onChange={(mode) => onChange({ mode })}
          size="sm"
          options={[
            { value: 'maxEligible', label: 'Maximum' },
            { value: 'percent', label: '% of value' },
            { value: 'amount', label: 'Fixed amount' },
          ]}
          hint={loan.mode === 'maxEligible' ? 'The most a bank can lend under RBI rules.' : undefined}
        />
        {loan.mode === 'percent' && <NumberInput label="Loan as % of property value" tip="ltv" suffix="%" value={loan.percent} onChange={(v) => onChange({ percent: v })} min={0} />}
        {loan.mode === 'amount' && <NumberInput label="Loan amount" tip="loanAmount" prefix="₹" words value={loan.amount} onChange={(v) => onChange({ amount: v })} min={0} />}
        <div className="grid grid-cols-2 gap-x-2 gap-y-5">
          <NumberInput label="Interest rate" tip="interestRate" suffix="% p.a." emptyAsZero min={0} value={loan.ratePct} onChange={(v) => onChange({ ratePct: v ?? 0 })} />
          <NumberInput label="Repay over" tip="tenure" suffix="years" emptyAsZero min={1} value={loan.tenureYears} onChange={(v) => onChange({ tenureYears: v ?? 0 })} />
          <NumberInput label="Processing fee" tip="processingFee" suffix="% of loan" emptyAsZero min={0} value={loan.processingFeePct} onChange={(v) => onChange({ processingFeePct: v ?? 0 })} />
          <NumberInput label="Monthly income (optional)" tip="monthlyIncome" prefix="₹" value={loan.monthlyIncome} onChange={(v) => onChange({ monthlyIncome: v })} min={0} />
        </div>
      </div>
    </Card>
  );
}
