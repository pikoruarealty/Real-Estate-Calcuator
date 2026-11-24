'use client';

import { GUJARAT_UNITS, OTHER_STATE_UNITS, UNIT_LABELS, VIGHA_VARIANTS } from '@/engine/config';
import { validateArea } from '@/engine/areas';
import { formatPct } from '@/engine/format';
import type { AreaInput, AreaResult, AreaUnit, KnownAreaType, VighaVariant } from '@/engine/types';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { Segmented } from '@/components/ui/Toggle';
import { Select } from '@/components/ui/Select';

export function UnitSelect({ value, onChange, label = 'Unit' }: { value: AreaUnit; onChange: (u: AreaUnit) => void; label?: string }) {
  return (
    <Select label={label} value={value} onChange={(v) => onChange(v as AreaUnit)} hideLabel>
      <optgroup label="Gujarat units">
        {GUJARAT_UNITS.map((u) => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
      </optgroup>
      <optgroup label="More units">
        {OTHER_STATE_UNITS.map((u) => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
      </optgroup>
    </Select>
  );
}

const KNOWN: { value: KnownAreaType; label: string }[] = [
  { value: 'carpet', label: 'Carpet' },
  { value: 'sbu', label: 'Super built-up' },
  { value: 'reraArea', label: 'RERA area' },
  { value: 'carpetAndSbu', label: 'Both' },
];

export function AreaInputs({ area, result, onChange }: { area: AreaInput; result: AreaResult; onChange: (p: Partial<AreaInput>) => void }) {
  const errors = validateArea(area);
  const both = area.knownType === 'carpetAndSbu';
  const valueLabel =
    area.knownType === 'carpet' ? 'Carpet area' : area.knownType === 'sbu' ? 'Super built-up area' : area.knownType === 'reraArea' ? 'RERA area' : 'Carpet area';
  const tipKey = area.knownType === 'carpetAndSbu' ? 'carpet' : area.knownType;

  const otherPct = area.mode === 'loading' ? result.kapatPct : result.loadingPct;
  const otherName = area.mode === 'loading' ? 'kapat' : 'loading';

  return (
    <Card title="What do you know?">
      <div className="space-y-4">
        <Segmented
          label="I know"
          value={area.knownType}
          options={KNOWN}
          onChange={(v) => onChange({ knownType: v })}
          size="sm"
        />

        <div className="grid grid-cols-[1fr_9.5rem] items-end gap-2">
          <NumberInput label={valueLabel} tip={tipKey} value={area.value} onChange={(v) => onChange({ value: v })} error={errors.value} placeholder="e.g. 1,200" />
          <UnitSelect value={area.unit} onChange={(unit) => onChange({ unit })} />
        </div>

        {both && (
          <div className="grid grid-cols-[1fr_9.5rem] items-end gap-2">
            <NumberInput label="Super built-up area" tip="sbu" value={area.sbuValue} onChange={(v) => onChange({ sbuValue: v })} error={errors.sbuValue} placeholder="e.g. 1,620" />
            <p className="pb-2 text-xs text-text-muted">in the same unit</p>
          </div>
        )}

        {area.unit === 'vigha' && (
          <Select label="Vigha size" value={area.vighaVariant} onChange={(v) => onChange({ vighaVariant: v as VighaVariant })}>
            {(Object.keys(VIGHA_VARIANTS) as VighaVariant[]).map((k) => (
              <option key={k} value={k}>{VIGHA_VARIANTS[k].sqft.toLocaleString('en-IN')} sq ft — {VIGHA_VARIANTS[k].label}</option>
            ))}
          </Select>
        )}

        {!both && (
          <div className="space-y-2">
            <Segmented
              label="Common area is given as"
              value={area.mode}
              options={[{ value: 'loading', label: 'Loading %' }, { value: 'kapat', label: 'Kapat %' }]}
              onChange={(mode) => onChange({ mode, pct: null })}
              tip={area.mode}
              size="sm"
            />
            <NumberInput
              label={area.mode === 'loading' ? 'Loading' : 'Kapat'}
              suffix="%"
              value={area.pct}
              onChange={(pct) => onChange({ pct })}
              error={errors.pct}
              placeholder={area.mode === 'loading' ? 'e.g. 35' : 'e.g. 25'}
              hint={otherPct != null ? `= ${formatPct(otherPct)} ${otherName}` : undefined}
            />
          </div>
        )}

        <details className="rounded-lg border border-border bg-bg px-3 py-2">
          <summary className="text-sm text-gold-muted hover:text-gold">Balcony, wash, terrace (sq ft)</summary>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <NumberInput label="Balcony" emptyAsZero value={area.balconySqft || null} onChange={(v) => onChange({ balconySqft: v ?? 0 })} min={0} />
            <NumberInput label="Wash" emptyAsZero value={area.washSqft || null} onChange={(v) => onChange({ washSqft: v ?? 0 })} min={0} />
            <NumberInput label="Terrace" emptyAsZero value={area.terraceSqft || null} onChange={(v) => onChange({ terraceSqft: v ?? 0 })} min={0} />
          </div>
          <p className="mt-2 text-xs text-text-muted">RERA area = carpet + balcony + wash + terrace.</p>
        </details>
      </div>
    </Card>
  );
}
