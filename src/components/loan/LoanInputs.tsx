'use client';

import type { CostResult, LoanInput } from '@/engine/types';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { Segmented } from '@/components/ui/Toggle';

export function LoanInputs({ loan, cost, onChange }: { loan: LoanInput; cost: CostResult | null; onChange: (p: Partial<LoanInput>) => void }) {
  return (
    <Card title="Loan details">
      <div className="space-y-4">
        <NumberInput
          label="Property value for the loan"
          tip="av"
          prefix="₹"
          value={loan.valueOverride}
          onChange={(v) => onChange({ valueOverride: v })}
          min={0}
          placeholder={cost ? new Intl.NumberFormat('en-IN').format(cost.agreementValue) : 'Uses the agreement value'}
          hint={cost ? 'Blank = your agreement value from the Cost Sheet tab.' : 'Enter a value, or fill the Cost Sheet tab first.'}
        />
        <Segmented
          label="Loan amount"
          tip="ltv"
          value={loan.mode}
          onChange={(mode) => onChange({ mode })}
          size="sm"
          options={[
            { value: 'maxEligible', label: 'Max eligible' },
            { value: 'percent', label: '% of value' },
            { value: 'amount', label: 'Amount' },
          ]}
        />
        {loan.mode === 'percent' && <NumberInput label="Loan as % of value" suffix="%" value={loan.percent} onChange={(v) => onChange({ percent: v })} min={0} />}
        {loan.mode === 'amount' && <NumberInput label="Loan amount" prefix="₹" value={loan.amount} onChange={(v) => onChange({ amount: v })} min={0} />}
        <div className="grid grid-cols-2 gap-3">
          <NumberInput label="Interest rate" suffix="% p.a." emptyAsZero min={0} value={loan.ratePct} onChange={(v) => onChange({ ratePct: v ?? 0 })} />
          <NumberInput label="Tenure" suffix="years" emptyAsZero min={1} value={loan.tenureYears} onChange={(v) => onChange({ tenureYears: v ?? 0 })} />
          <NumberInput label="Processing fee" suffix="%" emptyAsZero min={0} value={loan.processingFeePct} onChange={(v) => onChange({ processingFeePct: v ?? 0 })} />
          <NumberInput label="Monthly income (optional)" prefix="₹" value={loan.monthlyIncome} onChange={(v) => onChange({ monthlyIncome: v })} min={0} />
        </div>
      </div>
    </Card>
  );
}
