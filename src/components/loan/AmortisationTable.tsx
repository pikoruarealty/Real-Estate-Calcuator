import { formatINR } from '@/engine/format';
import type { LoanResult } from '@/engine/types';
import { Card } from '@/components/ui/Card';

export function AmortisationTable({ loan }: { loan: LoanResult }) {
  if (!loan.yearly.length) return null;
  return (
    <Card>
      <details>
        <summary className="font-display text-xl">Yearly amortisation</summary>
        <div className="mt-3 max-h-96 overflow-auto">
          <table className="w-full min-w-[26rem] text-sm">
            <caption className="sr-only">Year-wise principal and interest</caption>
            <thead className="sticky top-0 bg-surface text-xs text-text-muted">
              <tr>
                {['Year', 'Opening', 'Principal', 'Interest', 'Closing'].map((h, i) => (
                  <th key={h} scope="col" className={`px-2 py-1.5 font-medium ${i ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loan.yearly.map((y, i) => (
                <tr key={y.year} className={i % 2 ? '' : 'bg-surface-2/60'}>
                  <th scope="row" className="px-2 py-1.5 text-left font-normal">{y.year}</th>
                  <td className="px-2 py-1.5 text-right">{formatINR(y.opening)}</td>
                  <td className="px-2 py-1.5 text-right">{formatINR(y.principal)}</td>
                  <td className="px-2 py-1.5 text-right">{formatINR(y.interest)}</td>
                  <td className="px-2 py-1.5 text-right">{formatINR(y.closing)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Card>
  );
}
