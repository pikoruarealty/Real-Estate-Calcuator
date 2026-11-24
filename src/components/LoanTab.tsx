'use client';

import { useApp } from '@/state/CalculatorContext';
import { LoanInputs } from '@/components/loan/LoanInputs';
import { LoanTiles } from '@/components/loan/LoanTiles';
import { AmortisationTable } from '@/components/loan/AmortisationTable';
import { Card } from '@/components/ui/Card';
import { WarningList } from '@/components/ui/WarningBanner';
import { AdvisorButton } from '@/components/advisor/AdvisorButton';
import { NextStep } from '@/components/layout/Tabs';

export function LoanTab({ onBack }: { onBack: () => void }) {
  const { input, result, setLoan } = useApp();
  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0"><LoanInputs loan={input.loan} cost={result.cost} onChange={setLoan} /></div>
        <div className="min-w-0 space-y-4 lg:sticky lg:top-4 lg:self-start">
          {result.loan ? (
            <>
              <WarningList warnings={result.warnings} codes={['LOAN_CAPPED', 'EMI_INCOME_HIGH']} />
              <LoanTiles loan={result.loan} />
              <AmortisationTable loan={result.loan} />
              <Card className="text-center">
                <p className="mb-3 text-sm text-text-muted">Want help comparing banks or checking your eligibility?</p>
                <AdvisorButton />
              </Card>
            </>
          ) : (
            <Card title="Your loan">
              <p className="text-sm leading-relaxed text-text-muted">
                Finish <button type="button" onClick={onBack} className="text-gold underline">step 2 (Cost Sheet)</button> first, or type a property value on the left, to see your EMI, total interest and the cash you need upfront.
              </p>
            </Card>
          )}
        </div>
      </div>
      <NextStep label="" onClick={() => {}} back={{ label: 'Back to step 2', onClick: onBack }} />
    </div>
  );
}
