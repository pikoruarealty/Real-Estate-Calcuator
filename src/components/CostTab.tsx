'use client';

import { formatINR, formatINRWords } from '@/engine/format';
import { useApp } from '@/state/CalculatorContext';
import { CostInputs } from '@/components/cost/CostInputs';
import { CostSheetTable } from '@/components/cost/CostSheetTable';
import { EffectiveRateTiles } from '@/components/cost/EffectiveRateTiles';
import { CompositionBar } from '@/components/cost/CompositionBar';
import { PlainSummary } from '@/components/cost/PlainSummary';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { WarningList } from '@/components/ui/WarningBanner';
import { AdvisorButton } from '@/components/advisor/AdvisorButton';
import { ShareMenu } from '@/components/share/ShareMenu';
import { NextStep } from '@/components/layout/Tabs';

function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span aria-hidden className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${ok ? 'bg-gold text-black' : 'border border-border text-text-muted'}`}>
        {ok ? '✓' : ''}
      </span>
      <span className={ok ? 'text-text-muted line-through decoration-text-muted/40' : 'text-text'}>{children}</span>
      <span className="sr-only">{ok ? '(done)' : '(to do)'}</span>
    </li>
  );
}

export function CostTab({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { input, result, setCost } = useApp();
  const cost = result.cost;
  const costWarnings = result.warnings.filter((w) => w.code !== 'LOAN_CAPPED' && w.code !== 'EMI_INCOME_HIGH');
  const sbuBasis = input.cost.rateBasis === 'sbu';
  const haveArea = (sbuBasis ? result.area.sbuSqft : result.area.carpetSqft) != null;
  const haveRate = !!input.cost.baseRate && input.cost.baseRate > 0;

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0"><CostInputs cost={input.cost} area={result.area} result={cost} onChange={setCost} /></div>
        <div className="min-w-0 space-y-4">
          {cost ? (
            <>
              <Card>
                <p className="flex items-center text-xs uppercase tracking-wide text-text-muted">Your all-in cost<Tooltip term="allIn" /></p>
                <p className="font-display text-4xl leading-tight text-gold sm:text-5xl" aria-live="polite" data-testid="all-in">{formatINR(cost.allInCost)}</p>
                <p className="text-sm text-text-muted">{formatINRWords(cost.allInCost)} · price + builder charges + GST + stamp duty + registration</p>
                <p className="mt-3 flex flex-wrap items-center gap-x-1 text-xs text-text-muted/90">
                  <span className="flex items-center">TDS (not an extra cost)<Tooltip term="tds" />:</span>
                  <span>
                    {cost.tds.applies ? `hold back ${formatINR(cost.tds.amount)} (1% of ${formatINR(cost.tds.base)}) and pay it to the tax department` : 'not applicable below ₹50 lakh'}
                  </span>
                </p>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-2 text-xs text-text-muted">Save or share this estimate</p>
                  <ShareMenu />
                </div>
              </Card>
              <PlainSummary input={input} result={result} />
              <WarningList warnings={costWarnings} />
              <Card title="Full cost sheet" subtitle="Every rupee, line by line. Tap ⓘ on any line to see what it is.">
                <CostSheetTable cost={cost} />
              </Card>
              <Card title="Effective rates" subtitle="Your real price per sq ft, after everything is added.">
                <EffectiveRateTiles cost={cost} />
              </Card>
              <Card title="Where your money goes" tip="composition"><CompositionBar cost={cost} /></Card>
              <Card className="text-center">
                <p className="mb-3 text-sm text-text-muted">Not sure about a charge, or whether this is a fair price? Ask an expert before you pay anything.</p>
                <AdvisorButton />
              </Card>
            </>
          ) : (
            <Card title="Your all-in cost" subtitle="Two things are needed to calculate it:">
              <ul className="space-y-2.5">
                <Check ok={haveArea}>
                  {sbuBasis ? 'Super built-up area' : 'Carpet area'} —{' '}
                  {haveArea ? 'done' : (
                    <>
                      enter it in <button type="button" onClick={onBack} className="text-gold underline">step 1 (Area)</button>
                      {sbuBasis && result.area.carpetSqft != null && ': add the loading or kapat % so we can work out the super built-up area'}
                    </>
                  )}
                </Check>
                <Check ok={haveRate}>Base rate (price per sq ft) — {haveRate ? 'done' : 'enter it on the left, under “The price you were quoted”'}</Check>
              </ul>
              <p className="mt-4 text-sm leading-relaxed text-text-muted">
                Then your full cost sheet, with GST, stamp duty and registration, appears here instantly. Or press <strong className="text-gold">Example</strong> at the top to see a worked example.
              </p>
              <div className="mt-3"><WarningList warnings={costWarnings} /></div>
            </Card>
          )}
        </div>
      </div>
      <NextStep label="Next: step 3 — Loan & EMI" onClick={onNext} back={{ label: 'Back to step 1', onClick: onBack }} />
    </div>
  );
}
