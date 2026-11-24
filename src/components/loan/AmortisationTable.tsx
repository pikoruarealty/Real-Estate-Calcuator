import { formatINR } from '@/engine/format';
import type { LoanResult } from '@/engine/types';
import { Disclosure } from '@/components/ui/Card';

export function AmortisationTable({ loan }: { loan: LoanResult }) {
  if (!loan.yearly.length) return null;
  return (
    <Disclosure summary="Year by year" hint="How each year splits into interest and loan" tip="amortisation">
      <div className="max-h-96 overflow-auto">
        <table className="w-full min-w-[24rem] text-sm">
          <caption className="sr-only">Year-wise principal and interest</caption>
          <thead className="sticky top-0 bg-surface text-xs text-text-muted">
            <tr>
              {['Year', 'Loan paid', 'Interest', 'Left to pay'].map((h, i) => (
                <th key={h} scope="col" className={`px-2 py-2 font-normal ${i ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loan.yearly.map((y) => (
              <tr key={y.year} className="border-t border-white/5">
                <th scope="row" className="px-2 py-2 text-left font-normal text-text-muted">{y.year}</th>
                <td className="px-2 py-2 text-right">{formatINR(y.principal)}</td>
                <td className="px-2 py-2 text-right text-text-muted">{formatINR(y.interest)}</td>
                <td className="px-2 py-2 text-right">{formatINR(y.closing)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Disclosure>
  );
}
