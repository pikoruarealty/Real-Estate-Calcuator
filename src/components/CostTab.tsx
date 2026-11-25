'use client';

import { useEffect, useState, type ReactNode } from 'react';
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

/* ---------- Helpers ---------- */

/** Fade + rise in on mount, staggered. */
function Reveal({ i, children }: { i: number; children: ReactNode }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        on ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
      style={{ transitionDelay: `${i * 100}ms` }}
    >
      {children}
    </div>
  );
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  const [w, setW] = useState(0);
  const pct = total ? (done / total) * 100 : 0;
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);
  return (
    <div className="mt-5">
      <div className="mb-1.5 flex items-center justify-between text-xs tabular-nums text-text-muted">
        <span aria-hidden>{done} / {total}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold shadow-[0_0_12px_rgba(212,175,55,0.45)] transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}

/** One "what's still needed" row: clear done / to-do state, with the fix as a button on the right. */
function Check({ ok, children, action }: { ok: boolean; children: ReactNode; action?: ReactNode }) {
  return (
    <li
      className={`flex flex-wrap items-center gap-3 rounded-2xl p-3.5 ring-1 transition-all duration-500 ${
        ok ? 'bg-gold/[0.06] ring-gold/30' : 'bg-white/[0.03] ring-white/[0.08]'
      }`}
    >
      <span
        aria-hidden
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
          ok ? 'bg-gold text-black' : 'bg-transparent ring-2 ring-white/20'
        }`}
      >
        <span className={`transition-transform duration-500 ${ok ? 'scale-100 rotate-0' : 'scale-0 -rotate-45'}`}>
          <CheckIcon size={14} />
        </span>
      </span>
      <span className={`min-w-0 flex-1 text-[15px] ${ok ? 'text-text-muted' : 'font-medium text-text'}`}>{children}</span>
      {!ok && action}
      <span className="sr-only">{ok ? '(done)' : '(to do)'}</span>
    </li>
  );
}

const ShieldIcon = () => (
  <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export function CostTab({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { input, result, setCost } = useApp();
  const { t } = useT();
  const cost = result.cost;
  const warnings = result.warnings.filter((w) => w.code !== 'LOAN_CAPPED' && w.code !== 'EMI_INCOME_HIGH');
  const sbuBasis = input.cost.rateBasis === 'sbu';
  const haveArea = (sbuBasis ? result.area.sbuSqft : result.area.carpetSqft) != null;
  const haveRate = !!input.cost.baseRate && input.cost.baseRate > 0;
  const done = Number(haveArea) + Number(haveRate);

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="min-w-0"><CostInputs cost={input.cost} area={result.area} result={cost} onChange={setCost} /></div>
        <div className="min-w-0 space-y-4">
          {cost ? (
            <>
              <Reveal i={0}><CostHero cost={cost} /></Reveal>
              <Reveal i={1}><PlainSummary input={input} result={result} /></Reveal>
              {warnings.length > 0 && <Reveal i={2}><WarningList warnings={warnings} /></Reveal>}
              <Reveal i={3}>
                <Disclosure summary={t('cost.breakup')} hint={t('cost.breakupHint')} tip="allIn">
                  <CostSheetTable cost={cost} />
                </Disclosure>
              </Reveal>
              <Reveal i={4}>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-surface px-5 py-4 ring-1 ring-white/[0.06] transition-colors duration-300 hover:ring-gold/30 sm:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/20">
                      <ShieldIcon />
                    </span>
                    <p className="text-sm text-text-muted">{t('cost.fair')}</p>
                  </div>
                  <AdvisorButton variant="link" />
                </div>
              </Reveal>
            </>
          ) : (
            <Card>
              <div className="py-4">
                <div className="flex items-start gap-4">
                  <IconTile><ReceiptIcon size={26} /></IconTile>
                  <div className="min-w-0">
                    <p className="text-[17px] font-semibold tracking-tight">{t('cost.emptyTitle')}</p>
                    <p className="mt-1 text-sm text-text-muted">{t('cost.emptyNeed')}</p>
                  </div>
                </div>

                <ProgressBar done={done} total={2} />

                <ul className="mt-4 space-y-2.5">
                  <Check
                    ok={haveArea}
                    action={
                      <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-gold px-3.5 text-[13px] font-semibold text-black transition-all duration-300 hover:brightness-110 active:scale-95"
                      >
                        {sbuBasis && result.area.carpetSqft != null ? t('cost.addLoading') : t('cost.addStep1')}
                        <span aria-hidden>→</span>
                      </button>
                    }
                  >
                    {sbuBasis ? t('cost.needSbu') : t('cost.needCarpet')}
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