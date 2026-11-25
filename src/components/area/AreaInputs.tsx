'use client';

import { useState } from 'react';
import { REGIONAL_UNITS_BASE, OTHER_STATE_UNITS, UNIT_LABELS, VIGHA_VARIANTS } from '@/engine/config';
import { validateArea } from '@/engine/areas';
import { formatPct } from '@/engine/format';
import type { AreaInput, AreaResult, AreaUnit, KnownAreaType, VighaVariant } from '@/engine/types';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { Segmented } from '@/components/ui/Toggle';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';
import { useT } from '@/state/LanguageContext';
import type { MessageKey } from '@/content/i18n';

// Everyday units first; everything else is regional.
const COMMON_UNITS: AreaUnit[] = ['sqft', 'sqm', 'sqyd'];
const REGIONAL_UNITS: AreaUnit[] = [...REGIONAL_UNITS_BASE, ...OTHER_STATE_UNITS].filter((u) => !COMMON_UNITS.includes(u));

export function UnitSelect({ value, onChange, label = 'Unit', hideLabel = true }: { value: AreaUnit; onChange: (u: AreaUnit) => void; label?: string; hideLabel?: boolean }) {
  const { t } = useT();
  return (
    <Select label={label} value={value} onChange={(v) => onChange(v as AreaUnit)} hideLabel={hideLabel} tip="areaUnit">
      <optgroup label={t('units.common')}>
        {COMMON_UNITS.map((u) => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
      </optgroup>
      <optgroup label={t('units.regional')}>
        {REGIONAL_UNITS.map((u) => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
      </optgroup>
    </Select>
  );
}


const HINT_KEY: Record<KnownAreaType, MessageKey> = {
  carpet: 'area.hint.carpet',
  sbu: 'area.hint.sbu',
  reraArea: 'area.hint.rera',
  carpetAndSbu: 'area.hint.both',
};

export function AreaInputs({ area, result, onChange }: { area: AreaInput; result: AreaResult; onChange: (p: Partial<AreaInput>) => void }) {
  const { t } = useT();
  const KNOWN: { value: KnownAreaType; label: string; short?: string }[] = [
    { value: 'carpet', label: t('area.carpet') },
    { value: 'sbu', label: t('area.sbu'), short: t('area.sbuShort') },
    { value: 'reraArea', label: t('area.rera'), short: t('area.reraShort') },
    { value: 'carpetAndSbu', label: t('area.both') },
  ];
  const errors = validateArea(area);
  const both = area.knownType === 'carpetAndSbu';
  const [extrasOpen, setExtrasOpen] = useState(area.balconySqft + area.washSqft + area.terraceSqft > 0 || area.knownType === 'reraArea');
  const valueLabel =
    area.knownType === 'sbu' ? t('area.sbuArea') : area.knownType === 'reraArea' ? t('area.reraArea') : t('area.carpetArea');
  const tipKey = area.knownType === 'carpetAndSbu' ? 'carpet' : area.knownType;
  const otherPct = area.mode === 'loading' ? result.kapatPct : result.loadingPct;
  const otherName = area.mode === 'loading' ? 'kapat' : 'loading';

  return (
    <Card title={t('area.title')} subtitle={t('area.sub')}>
      <div className="space-y-5">
        <Segmented
          label={t('area.known')}
          tip="knownType"
          value={area.knownType}
          options={KNOWN}
          onChange={(v) => {
            onChange({ knownType: v });
            if (v === 'reraArea') setExtrasOpen(true);
          }}
          size="sm"
          hint={t(HINT_KEY[area.knownType])}
        />

        <div className="grid grid-cols-[1fr_8.5rem] items-end gap-2">
          <NumberInput label={valueLabel} tip={tipKey} value={area.value} onChange={(v) => onChange({ value: v })} error={errors.value} placeholder="1,200" />
          <UnitSelect value={area.unit} onChange={(unit) => onChange({ unit })} />
        </div>

        {both && (
          <NumberInput label={t('area.sbuArea')} tip="sbu" value={area.sbuValue} onChange={(v) => onChange({ sbuValue: v })} error={errors.sbuValue} placeholder="1,620" suffix={t('area.sameUnit')} />
        )}

        {area.unit === 'vigha' && (
          <Select label="Vigha size" tip="u_vigha" value={area.vighaVariant} onChange={(v) => onChange({ vighaVariant: v as VighaVariant })}>
            {(Object.keys(VIGHA_VARIANTS) as VighaVariant[]).map((k) => (
              <option key={k} value={k}>{VIGHA_VARIANTS[k].sqft.toLocaleString('en-IN')} sq ft — {VIGHA_VARIANTS[k].label}</option>
            ))}
          </Select>
        )}

        {!both && (
          <div>
            <div className="mb-2 flex items-center justify-between gap-2 text-[13px] text-text-muted">
              <span className="flex items-center">{t('area.common')}<Tooltip term={area.mode} /></span>
              <span role="radiogroup" aria-label="Common area is given as" className="flex rounded-full bg-surface-2 p-0.5 text-xs">
                {(['loading', 'kapat'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={area.mode === m}
                    onClick={() => onChange({ mode: m, pct: null })}
                    className={`min-h-7 rounded-full px-3 transition ${area.mode === m ? 'bg-white/10 text-text' : 'text-text-muted hover:text-text'}`}
                  >
                    {m === 'loading' ? t('results.loading') : t('results.kapat')}
                  </button>
                ))}
              </span>
            </div>
            <NumberInput
              label={area.mode === 'loading' ? t('area.loadingPct') : t('area.kapatPct')}
              hideLabel
              suffix="%"
              value={area.pct}
              onChange={(pct) => onChange({ pct })}
              error={errors.pct}
              placeholder={area.mode === 'loading' ? '35' : '25'}
              hint={otherPct != null ? `= ${formatPct(otherPct)} ${otherName}` : t('area.askBuilder')}
            />
          </div>
        )}

        {extrasOpen ? (
          <div className="rounded-2xl bg-bg/60 p-4">
            <p className="mb-3 flex items-center text-[13px] text-text-muted">{t('area.extrasTitle')}<Tooltip term="extras" /></p>
            <div className="grid grid-cols-3 gap-2">
              <NumberInput label={t('area.balcony')} emptyAsZero value={area.balconySqft || null} onChange={(v) => onChange({ balconySqft: v ?? 0 })} min={0} placeholder="0" />
              <NumberInput label={t('area.wash')} emptyAsZero value={area.washSqft || null} onChange={(v) => onChange({ washSqft: v ?? 0 })} min={0} placeholder="0" />
              <NumberInput label={t('area.terrace')} emptyAsZero value={area.terraceSqft || null} onChange={(v) => onChange({ terraceSqft: v ?? 0 })} min={0} placeholder="0" />
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setExtrasOpen(true)} className="text-sm text-text-muted transition hover:text-gold">
            {t('area.addExtras')}
          </button>
        )}
      </div>
    </Card>
  );
}
