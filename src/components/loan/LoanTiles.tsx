'use client';

import { LOAN_NOTE } from '@/content/copy';
import { formatINR, formatINRWords, formatPct } from '@/engine/format';
import type { LoanResult } from '@/engine/types';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Tooltip } from '@/components/ui/Tooltip';

function Stat({ label, value, sub, tip, gold }: { label: string; value: string; sub?: string; tip: string; gold?: boolean }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-4">
      <p className="flex items-center text-[13px] text-text-muted">{label}<Tooltip term={tip} /></p>
      <p className={`mt-1 text-xl font-semibold tracking-tight ${gold ? 'text-gold' : 'text-text'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-text-muted">{sub}</p>}
    </div>
  );
}

export function LoanTiles({ loan, tenureYears, ratePct }: { loan: LoanResult; tenureYears: number; ratePct: number }) {
  const total = loan.loanAmount + loan.totalInterest || 1;
  const pPct = (loan.loanAmount / total) * 100;
  return (
    <section className="relative overflow-hidden rounded-3xl bg-surface p-6 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
      <p className="relative flex items-center text-sm text-text-muted">Your EMI<Tooltip term="emi" /></p>
      <p className="relative mt-1 text-[42px] font-semibold leading-none tracking-tight text-gold sm:text-6xl">
        <AnimatedNumber value={loan.emi} format={formatINR} />
        <span className="ml-2 text-lg font-normal text-text-muted">/ month</span>
      </p>
      <p className="relative mt-3 text-sm text-text-muted">for {tenureYears} years at {ratePct}% interest</p>

      <div className="relative mt-7 grid grid-cols-2 gap-2">
        <Stat tip="upfrontCash" label="Cash you need" value={formatINRWords(loan.upfrontCash)} sub={loan.upfrontExcludesTaxes ? 'excl. taxes' : 'down payment + taxes + fees'} gold />
        <Stat tip="loanAmount" label="Bank lends" value={formatINRWords(loan.loanAmount)} sub={`${formatPct(loan.ltvUsedPct, 0)} of value${loan.capped ? ' · capped' : ''}`} />
        <Stat tip="totalInterest" label="Total interest" value={formatINRWords(loan.totalInterest)} />
        <Stat tip="totalRepayment" label="Total you repay" value={formatINRWords(loan.totalRepayment)} />
      </div>

      <div className="relative mt-7">
        <div className="flex h-2.5 gap-[3px] overflow-hidden rounded-full" role="img" aria-label={`Principal ${formatPct(pPct, 0)}, interest ${formatPct(100 - pPct, 0)}`}>
          <div className="rounded-full bg-gold transition-all duration-500" style={{ width: `${pPct}%` }} />
          <div className="rounded-full bg-[#55524c] transition-all duration-500" style={{ width: `${100 - pPct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-[13px] text-text-muted">
          <span className="flex items-center"><span aria-hidden className="mr-2 h-2 w-2 rounded-full bg-gold" />Loan {formatPct(pPct, 0)}</span>
          <span className="flex items-center">Interest {formatPct(100 - pPct, 0)}<span aria-hidden className="ml-2 h-2 w-2 rounded-full bg-[#55524c]" /><Tooltip term="principalInterest" /></span>
        </div>
      </div>

      {loan.loanAmount > 0 && (
        <p className="relative mt-6 text-[15px] leading-relaxed text-text-muted">
          You borrow <b className="text-text">{formatINRWords(loan.loanAmount)}</b> and pay back <b className="text-text">{formatINRWords(loan.totalRepayment)}</b>.
          {loan.emiToIncomePct != null && (
            <> The EMI is <b className={loan.emiToIncomePct > 50 ? 'text-warn' : 'text-text'}>{formatPct(loan.emiToIncomePct, 0)}</b> of your income.</>
          )}
        </p>
      )}
      <p className="relative mt-4 text-xs text-text-muted/80">{LOAN_NOTE}</p>
    </section>
  );
}
