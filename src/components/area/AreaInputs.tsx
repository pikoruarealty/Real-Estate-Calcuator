'use client';

import { useEffect, useState, type ReactNode } from 'react';
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

/* ---------- Small helpers ---------- */

/** Fades and slides in when a conditional field appears, so changes never feel like a jump. */
function Enter({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className={`transition-all duration-300 ease-out motion-reduce:transition-none ${
        on ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** Soft grouped panel so related fields read as one block. */
const panelCls = 'rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]';

/** Two-option switch with a sliding thumb. Big touch targets, clear selected state. */
function ModeToggle({
  value, onChange, options, ariaLabel,
}: {
  value: 'loading' | 'kapat';
  onChange: (m: 'loading' | 'kapat') => void;
  options: { value: 'loading' | 'kapat'; label: string }[];
  ariaLabel: string;
}) {
  const idx = options.findIndex((o) => o.value === value);
  return (
    <span
      role="radiogroup"
      aria-label={ariaLabel}
      className="relative grid w-full grid-cols-2 rounded-full bg-surface-2 p-1 text-sm sm:w-56"
    >
      <span
        aria-hidden
        className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-gold shadow-md shadow-gold/20 transition-transform duration-300 ease-out motion-reduce:transition-none ${
          idx === 1 ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`relative z-10 min-h-9 rounded-full px-3 text-center transition-colors duration-300 ${
            value === o.value ? 'font-semibold text-black' : 'text-text-muted hover:text-text'
          }`}
        >
          {o.label}
        </button>
      ))}
    </span>
  );
}

const PlusIcon = () => (
  <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="shrink-0 transition-transform duration-300 group-hover:rotate-90">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

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
      <div className="space-y-4 sm:space-y-5">
        {/* 1. Which area do you know? */}
        <div className="min-w-0">
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
        </div>

        {/* 2. Enter the area + unit (stacks on very small screens) */}
        <div className="grid grid-cols-1 items-end gap-2 min-[360px]:grid-cols-[minmax(0,1fr)_8.5rem] sm:grid-cols-[minmax(0,1fr)_9.5rem]">
          <div className="min-w-0">
            <NumberInput label={valueLabel} tip={tipKey} value={area.value} onChange={(v) => onChange({ value: v })} error={errors.value} placeholder="1,200" />
          </div>
          <div className="min-w-0">
            <UnitSelect value={area.unit} onChange={(unit) => onChange({ unit })} />
          </div>
        </div>

        {both && (
          <Enter>
            <NumberInput label={t('area.sbuArea')} tip="sbu" value={area.sbuValue} onChange={(v) => onChange({ sbuValue: v })} error={errors.sbuValue} placeholder="1,620" suffix={t('area.sameUnit')} />
          </Enter>
        )}

        {area.unit === 'vigha' && (
          <Enter>
            <Select label="Vigha size" tip="u_vigha" value={area.vighaVariant} onChange={(v) => onChange({ vighaVariant: v as VighaVariant })}>
              {(Object.keys(VIGHA_VARIANTS) as VighaVariant[]).map((k) => (
                <option key={k} value={k}>{VIGHA_VARIANTS[k].sqft.toLocaleString('en-IN')} sq ft — {VIGHA_VARIANTS[k].label}</option>
              ))}
            </Select>
          </Enter>
        )}

        {/* 3. Common area (hidden when both areas are known, since it can be worked out) */}
        {!both && (
          <Enter>
            <div className={panelCls}>
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center text-[13px] font-medium text-text-muted">
                  {t('area.common')}
                  <Tooltip term={area.mode} />
                </span>
                <ModeToggle
                  value={area.mode}
                  onChange={(m) => onChange({ mode: m, pct: null })}
                  ariaLabel="Common area is given as"
                  options={[
                    { value: 'loading', label: t('results.loading') },
                    { value: 'kapat', label: t('results.kapat') },
                  ]}
                />
              </div>
              <div className="mt-3">
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
            </div>
          </Enter>
        )}

        {/* 4. Optional extras */}
        {extrasOpen ? (
          <Enter>
            <div className={panelCls}>
              <p className="mb-3 flex items-center text-[13px] font-medium text-text-muted">
                {t('area.extrasTitle')}
                <Tooltip term="extras" />
              </p>
              <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-3">
                <NumberInput label={t('area.balcony')} emptyAsZero value={area.balconySqft || null} onChange={(v) => onChange({ balconySqft: v ?? 0 })} min={0} placeholder="0" />
                <NumberInput label={t('area.wash')} emptyAsZero value={area.washSqft || null} onChange={(v) => onChange({ washSqft: v ?? 0 })} min={0} placeholder="0" />
                <NumberInput label={t('area.terrace')} emptyAsZero value={area.terraceSqft || null} onChange={(v) => onChange({ terraceSqft: v ?? 0 })} min={0} placeholder="0" />
              </div>
            </div>
          </Enter>
        ) : (
          <button
            type="button"
            onClick={() => setExtrasOpen(true)}
            className="group flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 px-4 text-sm text-text-muted transition-all duration-300 hover:border-gold/50 hover:bg-gold/[0.04] hover:text-gold active:scale-[0.99] motion-reduce:transform-none"
          >
            <PlusIcon />
            {t('area.addExtras')}
          </button>
        )}
      </div>
    </Card>
  );
}