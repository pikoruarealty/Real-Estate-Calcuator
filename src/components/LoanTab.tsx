'use client';

import { useApp } from '@/state/CalculatorContext';
import { LoanInputs } from '@/components/loan/LoanInputs';
import { LoanTiles } from '@/components/loan/LoanTiles';
import { AmortisationTable } from '@/components/loan/AmortisationTable';
import { Card } from '@/components/ui/Card';
import { WarningList } from '@/components/ui/WarningBanner';

export function LoanTab() {
  const { input, result, setLoan } = useApp();
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <LoanInputs loan={input.loan} cost={result.cost} onChange={setLoan} />
      <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        {result.loan ? (
          <>
            <WarningList warnings={result.warnings} codes={['LOAN_CAPPED', 'EMI_INCOME_HIGH']} />
            <LoanTiles loan={result.loan} />
            <AmortisationTable loan={result.loan} />
          </>
        ) : (
          <Card title="Your loan">
            <p className="text-sm text-text-muted">Fill in your price on the Cost Sheet tab, or enter a property value, to see eligibility, EMI and upfront cash needed.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
