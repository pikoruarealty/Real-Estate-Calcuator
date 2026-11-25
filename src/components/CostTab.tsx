'use client';

import { CheckIcon, IconTile, ReceiptIcon } from '@/components/ui/Icons';
import { useApp } from '@/state/CalculatorContext';
import { CostInputs } from '@/components/cost/CostInputs';
import { CostSheetTable } from '@/components/cost/CostSheetTable';
import { CostHero } from '@/components/cost/CostHero';
import { PlainSummary } from '@/components/cost/PlainSummary';
import { Card, Disclosure } from '@/components/ui/Card';
import { WarningList } from '@/components/ui/WarningBanner';
import { AdvisorButton } from '@/components/advisor/AdvisorButton';
import { useT } from '@/state/LanguageContext';
import { NextStep } from '@/components/layout/Tabs';

function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-[15px]">
      <span aria-hidden className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${ok ? 'bg-gold text-black' : 'bg-white/[0.06]'}`}>
        {ok ? <CheckIcon size={13} /> : null}
      </span>
      <span className={ok ? 'text-text-muted' : 'text-text'}>{children}</span>
      <span className="sr-only">{ok ? '(done)' : '(to do)'}</span>
    </li>
  );
}

export function CostTab({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { input, result, setCost } = useApp();
  const { t } = useT();
  const cost = result.cost;
  const warnings = result.warnings.filter((w) => w.code !== 'LOAN_CAPPED' && w.code !== 'EMI_INCOME_HIGH');
  const sbuBasis = input.cost.rateBasis === 'sbu';
  const haveArea = (sbuBasis ? result.area.sbuSqft : result.area.carpetSqft) != null;
  const haveRate = !!input.cost.baseRate && input.cost.baseRate > 0;

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="min-w-0"><CostInputs cost={input.cost} area={result.area} result={cost} onChange={setCost} /></div>
        <div className="min-w-0 space-y-4">
          {cost ? (
            <>
              <CostHero cost={cost} />
              <PlainSummary input={input} result={result} />
              <WarningList warnings={warnings} />
              <Disclosure summary={t('cost.breakup')} hint={t('cost.breakupHint')} tip="allIn">
                <CostSheetTable cost={cost} />
              </Disclosure>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-3xl bg-surface px-5 py-4 sm:px-6">
                <p className="text-sm text-text-muted">{t('cost.fair')}</p>
                <AdvisorButton variant="link" />
              </div>
            </>
          ) : (
            <Card>
              <div className="py-6">
                <IconTile><ReceiptIcon size={26} /></IconTile>
                <p className="mt-4 text-[17px] font-semibold tracking-tight">{t('cost.emptyTitle')}</p>
                <p className="mt-1 text-sm text-text-muted">{t('cost.emptyNeed')}</p>
                <ul className="mt-5 space-y-3">
                  <Check ok={haveArea}>
                    {sbuBasis ? t('cost.needSbu') : t('cost.needCarpet')}{' '}
                    {!haveArea && (
                      <button type="button" onClick={onBack} className="ml-1 text-sm text-gold hover:underline">
                        {sbuBasis && result.area.carpetSqft != null ? t('cost.addLoading') : t('cost.addStep1')}
                      </button>
                    )}
                  </Check>
                  <Check ok={haveRate}>{t('cost.needRate')}</Check>
                </ul>
              </div>
              {warnings.length > 0 && <div className="mt-2"><WarningList warnings={warnings} /></div>}
            </Card>
          )}
        </div>
      </div>
      <NextStep label={t('next.loan')} onClick={onNext} back={{ label: t('back.area'), onClick: onBack }} />
    </div>
  );
}
