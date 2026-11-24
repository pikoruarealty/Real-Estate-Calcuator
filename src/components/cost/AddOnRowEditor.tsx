'use client';

import { formatINR } from '@/engine/format';
import type { AddOnBasis, AddOnRow, GstChoice } from '@/engine/types';
import { NumberInput } from '@/components/ui/NumberInput';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { GLOSSARY } from '@/content/glossary';

export const BASIS_OPTIONS: { value: AddOnBasis; label: string; amountLabel: string; prefix?: string; suffix?: string }[] = [
  { value: 'perSqftSbu', label: '₹ per sq ft of super built-up', amountLabel: 'Rate per sq ft', prefix: '₹', suffix: '/ sq ft' },
  { value: 'perSqftCarpet', label: '₹ per sq ft of carpet', amountLabel: 'Rate per sq ft', prefix: '₹', suffix: '/ sq ft' },
  { value: 'lumpSum', label: 'Fixed amount (lump sum)', amountLabel: 'Amount', prefix: '₹' },
  { value: 'pctOfBase', label: '% of base price', amountLabel: 'Percent of base price', suffix: '%' },
  { value: 'perSqftMonth', label: '₹ per sq ft per month (maintenance)', amountLabel: 'Rate per sq ft per month', prefix: '₹', suffix: '/ sq ft / mo' },
];

export function AddOnRowEditor({
  row, computed, open, onToggle, onChange, onDelete,
}: {
  row: AddOnRow;
  computed: number | null;
  open: boolean;
  onToggle: (open: boolean) => void;
  onChange: (patch: Partial<AddOnRow>) => void;
  onDelete: () => void;
}) {
  const meta = BASIS_OPTIONS.find((b) => b.value === row.basis)!;
  const monthly = row.basis === 'perSqftMonth';
  const tipKey = row.presetKey && GLOSSARY[row.presetKey] ? row.presetKey : 'custom';
  return (
    <details open={open} onToggle={(e) => onToggle((e.currentTarget as HTMLDetailsElement).open)} className="rounded-lg border border-border bg-bg">
      <summary className="flex min-h-11 items-center gap-2 px-3 py-2 text-sm">
        <span aria-hidden className="chev text-xs text-text-muted">▶</span>
        <span className="flex min-w-0 flex-1 items-center">
          <span className="truncate">{row.name || 'Untitled charge'}</span>
          <Tooltip term={tipKey} />
        </span>
        <span className={`shrink-0 ${row.amount > 0 ? 'font-medium text-gold' : 'text-xs text-text-muted'}`}>
          {row.amount > 0 ? (computed != null ? formatINR(computed) : 'needs area') : 'Not on my quote · tap to add'}
        </span>
      </summary>
      <div className="space-y-3 border-t border-border p-3">
        <div>
          <div className="mb-1.5 flex min-h-6 items-center text-[13px] font-medium text-text-muted">
            <label htmlFor={`name-${row.id}`}>Charge name</label>
            <Tooltip term="chargeName" />
          </div>
          <input
            id={`name-${row.id}`}
            value={row.name}
            maxLength={120}
            onChange={(e) => onChange({ name: e.target.value })}
            className="min-h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select label="How is it charged?" tip="chargeBasis" value={row.basis} onChange={(v) => onChange({
            basis: v as AddOnBasis,
            ...(v === 'perSqftMonth' ? { months: row.months ?? 12, monthlyAreaBasis: row.monthlyAreaBasis ?? 'sbu' } : {}),
          })}>
            {BASIS_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </Select>
          <NumberInput label={meta.amountLabel} tip="chargeAmount" prefix={meta.prefix} suffix={meta.suffix} emptyAsZero min={0}
            words={row.basis === 'lumpSum'} placeholder="0"
            value={row.amount || null} onChange={(v) => onChange({ amount: v ?? 0 })}
            hint={row.amount > 0 && computed != null && row.basis !== 'lumpSum' ? `= ${formatINR(computed)} in total` : undefined} />
        </div>
        {monthly && (
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Months" tip="months" suffix="months" emptyAsZero min={0} value={row.months ?? null} onChange={(v) => onChange({ months: v ?? 0 })} />
            <Select label="Area used" tip="monthlyArea" value={row.monthlyAreaBasis ?? 'sbu'} onChange={(v) => onChange({ monthlyAreaBasis: v as 'sbu' | 'carpet' })}>
              <option value="sbu">Super built-up</option>
              <option value="carpet">Carpet</option>
            </Select>
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label="GST on this charge"
            tip="rowGst"
            value={String(row.gst)}
            onChange={(v) => onChange({ gst: (v === 'auto' ? 'auto' : Number(v)) as GstChoice })}
          >
            <option value="auto">Same as property</option>
            <option value="0">0%</option>
            <option value="5">5%</option>
            <option value="18">18%</option>
          </Select>
        </div>
        <div className="space-y-3 rounded-lg bg-surface-2/60 p-3">
          <Switch label="Included in agreement value" tip="inAV" checked={row.inAgreementValue} onChange={(v) => onChange({ inAgreementValue: v })}
            hint={row.inAgreementValue ? 'GST, stamp duty & registration apply to it' : 'Paid to the builder separately, outside the agreement'} />
          <Switch label="Refundable" tip="refundable" checked={row.refundable} onChange={(v) => onChange({ refundable: v })} />
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onDelete} className="text-error hover:text-error" aria-label={`Delete ${row.name}`}>Delete charge</Button>
        </div>
      </div>
    </details>
  );
}
