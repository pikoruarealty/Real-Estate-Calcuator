'use client';

import { BankIcon, IconTile } from '@/components/ui/Icons';
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
      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-6">
        <div className="min-w-0"><LoanInputs loan={input.loan} cost={result.cost} onChange={setLoan} /></div>
        <div className="min-w-0 space-y-4">
          {result.loan ? (
            <>
              <LoanTiles loan={result.loan} tenureYears={input.loan.tenureYears} ratePct={input.loan.ratePct} />
              <WarningList warnings={result.warnings} codes={['LOAN_CAPPED', 'EMI_INCOME_HIGH']} />
              <AmortisationTable loan={result.loan} />
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-3xl bg-surface px-5 py-4 sm:px-6">
                <p className="text-sm text-text-muted">Want help picking a bank?</p>
                <AdvisorButton variant="link" />
              </div>
            </>
          ) : (
            <Card>
              <div className="py-6">
                <IconTile><BankIcon size={26} /></IconTile>
                <p className="mt-4 text-[17px] font-semibold tracking-tight">Your EMI shows up here</p>
                <p className="mt-1 text-sm text-text-muted">
                  Finish <button type="button" onClick={onBack} className="text-gold hover:underline">step 2</button> first, or type a property value.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
      <NextStep back={{ label: 'Cost Sheet', onClick: onBack }} />
    </div>
  );
}
