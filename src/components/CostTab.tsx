'use client';

import { formatINR, formatINRWords } from '@/engine/format';
import { useApp } from '@/state/CalculatorContext';
import { CostInputs } from '@/components/cost/CostInputs';
import { CostSheetTable } from '@/components/cost/CostSheetTable';
import { EffectiveRateTiles } from '@/components/cost/EffectiveRateTiles';
import { CompositionBar } from '@/components/cost/CompositionBar';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { WarningList } from '@/components/ui/WarningBanner';
import { AdvisorButton } from '@/components/advisor/AdvisorButton';
import { ShareMenu } from '@/components/share/ShareMenu';

export function CostTab() {
  const { input, result, setCost } = useApp();
  const cost = result.cost;
  const costWarnings = result.warnings.filter((w) => w.code !== 'LOAN_CAPPED' && w.code !== 'EMI_INCOME_HIGH');

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="min-w-0"><CostInputs cost={input.cost} area={result.area} result={cost} onChange={setCost} /></div>
      <div className="min-w-0 space-y-4">
        {cost ? (
          <>
            <Card>
              <p className="text-xs uppercase tracking-wide text-text-muted">All-in cost</p>
              <p className="font-display text-5xl leading-tight text-gold" aria-live="polite" data-testid="all-in">{formatINR(cost.allInCost)}</p>
              <p className="text-sm text-text-muted">{formatINRWords(cost.allInCost)}</p>
              <p className="mt-3 flex flex-wrap items-center gap-x-1 text-xs text-text-muted/90">
                <span>TDS (information only, not an extra cost)<Tooltip term="tds" />:</span>
                <span className={cost.tds.applies ? 'text-text-muted' : ''}>
                  {cost.tds.applies ? `deduct ${formatINR(cost.tds.amount)} (1% of ${formatINR(cost.tds.base)}) and pay it to the government` : 'not applicable below ₹50 lakh'}
                </span>
              </p>
              <div className="mt-4"><ShareMenu /></div>
            </Card>
            <Card className="text-center">
              <p className="mb-3 text-sm text-text-muted">Unsure about a charge or the agreement? Get a second opinion before you pay.</p>
              <AdvisorButton />
            </Card>
            <WarningList warnings={costWarnings} />
            <Card title="Cost sheet"><CostSheetTable cost={cost} /></Card>
            <Card title="Effective rates"><EffectiveRateTiles cost={cost} /></Card>
            <Card title="Where your money goes"><CompositionBar cost={cost} /></Card>
          </>
        ) : (
          <Card title="Your all-in cost">
            <p className="text-sm text-text-muted">
              Enter your base rate here and your area on the <strong className="text-text">Area &amp; Units</strong> tab. Your full cost sheet, with GST, stamp duty and registration, appears here instantly. Or try the <strong className="text-gold">Example</strong> button above.
            </p>
            <div className="mt-3"><WarningList warnings={costWarnings} /></div>
          </Card>
        )}
      </div>
    </div>
  );
}
