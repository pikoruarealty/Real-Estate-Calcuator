'use client';

import { formatINR } from '@/engine/format';
import type { AddOnBasis, AddOnRow, GstChoice } from '@/engine/types';
import { NumberInput } from '@/components/ui/NumberInput';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Toggle';
import { Tooltip } from '@/components/ui/Tooltip';
import { GLOSSARY } from '@/content/glossary';

export const BASIS_OPTIONS: { value: AddOnBasis; label: string; amountLabel: string; prefix?: string; suffix?: string }[] = [
  { value: 'perSqftSbu', label: '₹ per sq ft of super built-up', amountLabel: 'Rate', prefix: '₹', suffix: 'per sq ft' },
  { value: 'perSqftCarpet', label: '₹ per sq ft of carpet', amountLabel: 'Rate', prefix: '₹', suffix: 'per sq ft' },
  { value: 'lumpSum', label: 'Fixed amount', amountLabel: 'Amount', prefix: '₹' },
  { value: 'pctOfBase', label: '% of base price', amountLabel: 'Percent of base price', suffix: '%' },
  { value: 'perSqftMonth', label: '₹ per sq ft per month', amountLabel: 'Rate', prefix: '₹', suffix: '/ sq ft / month' },
];

export function AddOnRowEditor({
  row, computed, open, autoFocus, onToggle, onChange, onRemove,
}: {
  row: AddOnRow;
  computed: number | null;
  open: boolean;
  autoFocus?: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<AddOnRow>) => void;
  onRemove: () => void;
}) {
  const meta = BASIS_OPTIONS.find((b) => b.value === row.basis)!;
  const monthly = row.basis === 'perSqftMonth';
  const tipKey = row.presetKey && GLOSSARY[row.presetKey] ? row.presetKey : 'custom';
  const panelId = `charge-${row.id}`;

  return (
    <div className={`rounded-2xl transition ${open ? 'bg-surface-2' : 'bg-surface-2/50 hover:bg-surface-2'}`}>
      <div className="flex items-center pr-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-2xl pl-4 text-left"
        >
          <span className="min-w-0 flex-1 truncate text-[15px]">{row.name || 'Untitled charge'}</span>
          <span className={`shrink-0 text-[15px] ${row.amount > 0 ? 'font-medium text-gold' : 'text-text-muted'}`}>
            {row.amount > 0 ? (computed != null ? formatINR(computed) : 'needs area') : 'Enter amount'}
          </span>
        </button>
        <Tooltip term={tipKey} />
      </div>

      {open && (
        <div id={panelId} className="space-y-4 px-4 pb-4">
          <NumberInput
            label={meta.amountLabel}
            prefix={meta.prefix}
            suffix={meta.suffix}
            emptyAsZero
            min={0}
            autoFocus={autoFocus}
            words={row.basis === 'lumpSum'}
            placeholder="0"
            value={row.amount || null}
            onChange={(v) => onChange({ amount: v ?? 0 })}
            hint={row.amount > 0 && computed != null && row.basis !== 'lumpSum' ? `= ${formatINR(computed)} in total` : undefined}
          />
          {monthly && (
            <div className="grid grid-cols-2 gap-2">
              <NumberInput label="Months" tip="months" emptyAsZero min={0} value={row.months ?? null} onChange={(v) => onChange({ months: v ?? 0 })} />
              <Select label="On area" tip="monthlyArea" value={row.monthlyAreaBasis ?? 'sbu'} onChange={(v) => onChange({ monthlyAreaBasis: v as 'sbu' | 'carpet' })}>
                <option value="sbu">Super built-up</option>
                <option value="carpet">Carpet</option>
              </Select>
            </div>
          )}

          <details className="group">
            <summary className="flex min-h-8 items-center gap-1 text-[13px] text-text-muted hover:text-text">
              <span aria-hidden className="transition group-open:rotate-90">›</span> How it’s charged &amp; taxed
            </summary>
            <div className="mt-3 space-y-4">
              <div>
                <div className="mb-2 flex min-h-5 items-center text-[13px] text-text-muted">
                  <label htmlFor={`name-${row.id}`}>Name</label>
                  <Tooltip term="chargeName" />
                </div>
                <input
                  id={`name-${row.id}`}
                  value={row.name}
                  maxLength={120}
                  onChange={(e) => onChange({ name: e.target.value })}
                  className="h-12 w-full rounded-2xl bg-surface px-4 text-base ring-1 ring-transparent hover:ring-white/10 focus:outline-none focus-visible:ring-gold/70 sm:text-[15px]"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select label="Charged as" tip="chargeBasis" value={row.basis} onChange={(v) => onChange({
                  basis: v as AddOnBasis,
                  ...(v === 'perSqftMonth' ? { months: row.months ?? 12, monthlyAreaBasis: row.monthlyAreaBasis ?? 'sbu' } : {}),
                })}>
                  {BASIS_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </Select>
                <Select label="GST" tip="rowGst" value={String(row.gst)} onChange={(v) => onChange({ gst: (v === 'auto' ? 'auto' : Number(v)) as GstChoice })}>
                  <option value="auto">Same as property</option>
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="18">18%</option>
                </Select>
              </div>
              <Switch label="Part of agreement value" tip="inAV" checked={row.inAgreementValue} onChange={(v) => onChange({ inAgreementValue: v })}
                hint={row.inAgreementValue ? 'Stamp duty & registration apply to it' : 'Paid to the builder separately'} />
              <Switch label="Refundable" tip="refundable" checked={row.refundable} onChange={(v) => onChange({ refundable: v })} />
            </div>
          </details>

          <button type="button" onClick={onRemove} className="text-[13px] text-text-muted hover:text-error">Remove this charge</button>
        </div>
      )}
    </div>
  );
}
