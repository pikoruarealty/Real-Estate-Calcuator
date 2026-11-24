import { LOAN_NOTE } from '@/content/copy';
import { formatINR, formatINRWords, formatPct } from '@/engine/format';
import type { LoanResult } from '@/engine/types';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';

function Tile({ label, value, sub, gold, tip }: { label: string; value: string; sub?: string; gold?: boolean; tip: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-3">
      <p className="flex items-center text-[11px] uppercase tracking-wide text-text-muted">{label}<Tooltip term={tip} /></p>
      <p className={`mt-1 text-xl font-semibold ${gold ? 'text-gold' : 'text-text'}`}>{value}</p>
      {sub && <p className="text-[11px] text-text-muted">{sub}</p>}
    </div>
  );
}

export function LoanTiles({ loan }: { loan: LoanResult }) {
  const total = loan.loanAmount + loan.totalInterest || 1;
  const pPct = (loan.loanAmount / total) * 100;
  return (
    <Card title="Your loan at a glance">
      <div className="grid grid-cols-2 gap-2">
        <Tile tip="loanAmount" label="Loan amount" value={formatINRWords(loan.loanAmount)} sub={`${formatPct(loan.ltvUsedPct, 1)} of value${loan.capped ? ' (capped)' : ''}`} />
        <Tile tip="emi" label="EMI / month" value={formatINR(loan.emi)} sub="Paid every month" gold />
        <Tile tip="totalInterest" label="Total interest" value={formatINRWords(loan.totalInterest)} sub="Bank’s earnings" />
        <Tile tip="totalRepayment" label="Total repayment" value={formatINRWords(loan.totalRepayment)} sub="Loan + interest" />
        <div className="col-span-2">
          <Tile
            tip="upfrontCash"
            label="Upfront cash needed"
            value={formatINR(loan.upfrontCash)}
            sub={loan.upfrontExcludesTaxes ? 'Excluding taxes (no cost sheet yet) · includes processing fee' : 'All-in cost − loan + processing fee'}
            gold
          />
        </div>
      </div>
      <div className="mt-4">
        <p className="mb-2 flex items-center text-[13px] font-medium text-text-muted">Principal vs interest<Tooltip term="principalInterest" /></p>
        <div
          role="img"
          aria-label={`Principal ${formatPct(pPct, 1)}, interest ${formatPct(100 - pPct, 1)}`}
          className="flex h-3 overflow-hidden rounded-full border border-border"
        >
          <div style={{ width: `${pPct}%` }} className="bg-gold" />
          <div style={{ width: `${100 - pPct}%`, background: 'repeating-linear-gradient(45deg,#8c887e 0 4px,#2a2a2a 4px 8px)' }} />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-text-muted">
          <span><span aria-hidden className="mr-1 inline-block h-2 w-2 bg-gold" />Principal {formatPct(pPct, 1)}</span>
          <span><span aria-hidden className="mr-1 inline-block h-2 w-2 bg-[#8c887e]" />Interest {formatPct(100 - pPct, 1)}</span>
        </div>
      </div>
      {loan.loanAmount > 0 && (
        <p className="mt-4 rounded-lg bg-surface-2 p-3 text-sm leading-relaxed">
          You borrow <strong className="text-gold">{formatINRWords(loan.loanAmount)}</strong> and pay back{' '}
          <strong className="text-text">{formatINRWords(loan.totalRepayment)}</strong> in total, so the loan costs you{' '}
          <strong className="text-text">{formatINRWords(loan.totalInterest)}</strong> in interest.
          {loan.emiToIncomePct != null && (
            <> Your EMI takes <strong className={loan.emiToIncomePct > 50 ? 'text-warn' : 'text-text'}>{formatPct(loan.emiToIncomePct, 0)}</strong> of your monthly income.</>
          )}
        </p>
      )}
      <p className="mt-3 text-xs text-text-muted">{LOAN_NOTE}</p>
    </Card>
  );
}
