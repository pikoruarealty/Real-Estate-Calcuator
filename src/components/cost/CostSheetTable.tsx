'use client';

import { formatINR, formatPct } from '@/engine/format';
import type { CostResult } from '@/engine/types';
import { buildSheet, type SheetSection } from '@/lib/sheet';
import { Tooltip } from '@/components/ui/Tooltip';
import { lineTipKey } from '@/content/glossary';

const cell = 'px-2 py-2 text-right align-top whitespace-nowrap';

function BlockHeader({ title, sub, tip }: { title: string; sub?: string; tip?: string }) {
  return (
    <tr>
      <th scope="colgroup" colSpan={5} className="px-2 pb-2 pt-5 text-left">
        <span className="flex items-center text-xs font-semibold uppercase tracking-wide text-gold">{title}{tip && <Tooltip term={tip} />}</span>
        {sub && <span className="block text-xs font-normal normal-case text-text-muted">{sub}</span>}
      </th>
    </tr>
  );
}

function Rows({ section, showGst }: { section: SheetSection; showGst: boolean }) {
  return (
    <>
      {section.rows.map((l) => (
        <tr key={l.key} className="border-b border-white/5">
          <th scope="row" className="px-2 py-2 text-left align-top font-normal">
            {l.label}
            <Tooltip term={lineTipKey(l.key)} />
            {l.refundable && <span className="ml-1.5 rounded-full bg-gold/10 px-2 py-0.5 text-[10px] text-gold">refundable</span>}
            <span className="block text-xs text-text-muted @2xl:hidden">{l.calc}</span>
          </th>
          <td className="hidden px-2 py-2 text-xs text-text-muted @2xl:table-cell">{l.calc}</td>
          <td className={cell}>{formatINR(l.amount)}</td>
          <td className={`${cell} text-text-muted`}>
            {showGst && l.gstAmount != null ? (
              <>
                {formatINR(l.gstAmount)}
                <span className="block text-[11px]">@ {formatPct(l.gstPct ?? 0)}</span>
              </>
            ) : '—'}
          </td>
          <td className={cell}>{formatINR(l.amount + (showGst ? l.gstAmount ?? 0 : 0))}</td>
        </tr>
      ))}
    </>
  );
}

function Subtotal({ label, s, gstPct, tip }: { label: string; s: { amount: number; gst: number; total: number }; gstPct?: number; tip?: string }) {
  return (
    <tr className="border-b border-white/5 font-semibold">
      <th scope="row" className="px-2 py-2 text-left">{label}{tip && <Tooltip term={tip} />}</th>
      <td className="hidden @2xl:table-cell" />
      <td className={cell}>{formatINR(s.amount)}</td>
      <td className={cell}>
        {s.gst ? formatINR(s.gst) : '—'}
        {gstPct != null && s.gst > 0 && <span className="block text-[11px] font-normal text-text-muted">@ {formatPct(gstPct)}</span>}
      </td>
      <td className={cell}>{formatINR(s.total)}</td>
    </tr>
  );
}

export function CostSheetTable({ cost }: { cost: CostResult }) {
  const s = buildSheet(cost);
  return (
    <div className="@container overflow-x-auto">
      <table className="w-full min-w-[20rem] border-collapse text-sm">
        <caption className="sr-only">Cost sheet: agreement value, other builder charges and government charges</caption>
        <thead>
          <tr className="text-xs text-text-muted">
            <th scope="col" className="px-2 py-1 text-left font-medium">Item</th>
            <th scope="col" className="hidden px-2 py-1 text-left font-medium @2xl:table-cell">Calculation</th>
            <th scope="col" className="px-2 py-1 text-right font-medium">Amount</th>
            <th scope="col" className="px-2 py-1 text-right font-medium">GST</th>
            <th scope="col" className="px-2 py-1 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          <BlockHeader title="A · Agreement value" sub="The price written in your sale agreement. GST is added on it." tip="blockA" />
          <Rows section={s.a} showGst={false} />
          <Subtotal label="Agreement value + GST" s={s.a} gstPct={cost.propertyGstPct} tip="gstAv" />

          {s.b.rows.length > 0 && (
            <>
              <BlockHeader title="B · Other builder charges" sub="Paid to the builder separately, each with its own GST." tip="blockB" />
              <Rows section={s.b} showGst />
              <Subtotal label="Other charges subtotal" s={s.b} />
            </>
          )}

          <tr className="border-b border-white/5 font-semibold">
            <th scope="row" className="px-2 py-2 text-left">Payable to builder (A + B)<Tooltip term="payableToBuilder" /></th>
            <td className="hidden @2xl:table-cell" />
            <td colSpan={2} />
            <td className={cell}>{formatINR(cost.payableToBuilder)}</td>
          </tr>

          <BlockHeader title="C · Government charges" sub="Paid to the government when you register the home." tip="governmentTotal" />
          <Rows section={s.c} showGst={false} />
          <Subtotal label="Government total" s={s.c} tip="governmentTotal" />
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="px-2 pb-1 pt-5 text-left text-base font-semibold text-gold">All-in cost (A + B + C)<Tooltip term="allIn" /></th>
            <td className="hidden @2xl:table-cell" />
            <td colSpan={2} />
            <td className="px-2 pb-1 pt-5 text-right text-base font-semibold text-gold">{formatINR(cost.allInCost)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
