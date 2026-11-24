'use client';

import { formatINR, formatPct } from '@/engine/format';
import type { CostResult } from '@/engine/types';
import { buildSheet, type SheetSection } from '@/lib/sheet';
import { Tooltip } from '@/components/ui/Tooltip';

const cell = 'px-2 py-2 text-right align-top whitespace-nowrap';

function BlockHeader({ title, tip }: { title: string; tip?: string }) {
  return (
    <tr>
      <th scope="colgroup" colSpan={5} className="bg-surface-2 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gold">
        {title}{tip && <Tooltip term={tip} />}
      </th>
    </tr>
  );
}

function Rows({ section, showGst }: { section: SheetSection; showGst: boolean }) {
  return (
    <>
      {section.rows.map((l) => (
        <tr key={l.key} className="border-b border-border/60">
          <th scope="row" className="px-2 py-2 text-left align-top font-normal">
            {l.label}
            {l.refundable && <span className="ml-1.5 rounded border border-gold-muted px-1 text-[10px] text-gold-muted">refundable</span>}
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

function Subtotal({ label, s, gstPct }: { label: string; s: { amount: number; gst: number; total: number }; gstPct?: number }) {
  return (
    <tr className="border-b border-border bg-surface-2/60 font-semibold">
      <th scope="row" className="px-2 py-2 text-left">{label}</th>
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
          <BlockHeader title="A · Agreement value" tip="av" />
          <Rows section={s.a} showGst={false} />
          <Subtotal label="Agreement value + GST" s={s.a} gstPct={cost.propertyGstPct} />

          {s.b.rows.length > 0 && (
            <>
              <BlockHeader title="B · Other builder charges" />
              <Rows section={s.b} showGst />
              <Subtotal label="Other charges subtotal" s={s.b} />
            </>
          )}

          <tr className="border-b border-border font-semibold">
            <th scope="row" className="px-2 py-2 text-left">Payable to builder (A + B)</th>
            <td className="hidden @2xl:table-cell" />
            <td colSpan={2} />
            <td className={cell}>{formatINR(cost.payableToBuilder)}</td>
          </tr>

          <BlockHeader title="C · Government charges" tip="sv" />
          <Rows section={s.c} showGst={false} />
          <Subtotal label="Government total" s={s.c} />
        </tbody>
        <tfoot>
          <tr className="bg-gold/10">
            <th scope="row" className="px-2 py-3 text-left font-display text-lg text-gold">All-in cost</th>
            <td className="hidden @2xl:table-cell" />
            <td colSpan={2} />
            <td className="px-2 py-3 text-right font-display text-lg text-gold">{formatINR(cost.allInCost)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
