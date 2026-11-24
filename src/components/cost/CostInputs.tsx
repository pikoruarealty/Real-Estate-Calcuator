'use client';

import { GST, REGISTRATION_CAP, REGISTRATION_PCT, SQFT_PER_SQM, STAMP_DUTY_PCT } from '@/engine/config';
import { formatINR } from '@/engine/format';
import type { AreaResult, BuyerType, CostInput, CostResult, PropertyType, StatutoryOverrides } from '@/engine/types';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { Segmented, Switch } from '@/components/ui/Toggle';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';
import { AddOnRows } from './AddOnRows';

export function CostInputs({
  cost, area, result, onChange,
}: {
  cost: CostInput;
  area: AreaResult;
  result: CostResult | null;
  onChange: (p: Partial<CostInput>) => void;
}) {
  const commercial = cost.propertyType === 'commercialOffice' || cost.propertyType === 'shop';
  const S = area.sbuSqft;
  const C = area.carpetSqft;

  let equivalent: string | null = null;
  if (cost.baseRate && S && C) {
    equivalent =
      cost.rateBasis === 'sbu'
        ? `= ${formatINR(cost.baseRate * (S / C))} per carpet sq ft`
        : `= ${formatINR(cost.baseRate * (C / S))} per SBU sq ft`;
  }

  const setOverride = (patch: Partial<StatutoryOverrides>) => {
    const next: StatutoryOverrides = { ...cost.overrides, ...patch };
    for (const k of Object.keys(next) as (keyof StatutoryOverrides)[]) if (next[k] === undefined) delete next[k];
    onChange({ overrides: next });
  };
  const ov = cost.overrides;

  return (
    <div className="space-y-4">
      <Card title="Your property">
        <div className="space-y-4">
          <Select label="Property type" value={cost.propertyType} onChange={(v) => onChange({ propertyType: v as PropertyType })}>
            <option value="flat">Flat / apartment</option>
            <option value="penthouse">Penthouse</option>
            <option value="commercialOffice">Commercial office</option>
            <option value="shop">Shop</option>
          </Select>
          {commercial && (
            <Select label="GST on commercial property" value={cost.commercialGst} onChange={(v) => onChange({ commercialGst: Number(v) as 5 | 12 })}>
              <option value={12}>12%</option>
              <option value={5}>5%</option>
            </Select>
          )}
          <div>
            <label htmlFor="projectName" className="mb-1.5 block text-xs font-medium text-text-muted">Project name (optional, printed on PDF)</label>
            <input
              id="projectName"
              value={cost.projectName}
              maxLength={120}
              onChange={(e) => onChange({ projectName: e.target.value })}
              className="min-h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm placeholder:text-text-muted/50"
              placeholder="e.g. Skyline Heights, Bopal"
            />
          </div>
          <Segmented
            label="Construction status"
            value={cost.status}
            onChange={(status) => onChange({ status })}
            options={[{ value: 'underConstruction', label: 'Under construction' }, { value: 'ready', label: 'Ready (BU received)' }]}
            tip={cost.status === 'ready' ? 'bu' : 'gst'}
            size="sm"
          />
          <Select label="Buyer" value={cost.buyerType} onChange={(v) => onChange({ buyerType: v as BuyerType })} tip="registration">
            <option value="male">Male / other</option>
            <option value="soleWoman">Sole woman buyer (registration waived)</option>
            <option value="joint">Joint buyers</option>
            <option value="company">Company / firm</option>
          </Select>
        </div>
      </Card>

      <Card title="Price">
        <div className="space-y-4">
          <div className="space-y-2">
            <NumberInput label="Base rate" prefix="₹" suffix="/ sq ft" value={cost.baseRate} onChange={(v) => onChange({ baseRate: v })} min={0} placeholder="e.g. 6,500" hint={equivalent ?? undefined} />
            <Segmented
              label="Rate is on"
              value={cost.rateBasis}
              onChange={(rateBasis) => onChange({ rateBasis })}
              options={[{ value: 'sbu', label: 'Super built-up' }, { value: 'carpet', label: 'Carpet' }]}
              size="sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <NumberInput label="Floor" emptyAsZero min={0} value={cost.floor || null} onChange={(v) => onChange({ floor: v ?? 0 })} />
            <NumberInput label="FRC from floor" tip="frc" emptyAsZero min={0} value={cost.frcBaseFloor || null} onChange={(v) => onChange({ frcBaseFloor: v ?? 0 })} />
            <NumberInput label="FRC / floor" prefix="₹" emptyAsZero min={0} value={cost.frcRatePerFloor || null} onChange={(v) => onChange({ frcRatePerFloor: v ?? 0 })} />
          </div>
          <p className="-mt-2 text-xs text-text-muted">FRC = billing area × rate × floors above the “FRC from floor”.</p>
        </div>
      </Card>

      <Card title="Add charges from your builder's quote">
        <details className="group" open>
          <summary className="mb-3 text-sm text-gold-muted hover:text-gold">Show / hide charges</summary>
          <AddOnRows rows={cost.addOns} area={area} basePrice={result?.basePrice ?? 0} onChange={(addOns) => onChange({ addOns })} />
        </details>
      </Card>

      <Card title="Agreement value & Jantri">
        <div className="space-y-4">
          <NumberInput
            label="Agreement value (optional)"
            tip="av"
            prefix="₹"
            value={cost.agreementValueOverride}
            onChange={(v) => onChange({ agreementValueOverride: v })}
            min={0}
            hint="If your agreement states a value, enter it — taxes are calculated on it."
          />
          <div className="space-y-2">
            <p className="text-xs font-medium text-text-muted">Jantri value<Tooltip term="jantri" /> (optional — enter the value, or the rate)</p>
            <NumberInput label="Jantri value" prefix="₹" value={cost.jantriValue} onChange={(v) => onChange({ jantriValue: v })} min={0} />
            <div className="grid grid-cols-2 gap-2">
              <NumberInput label="Jantri rate" prefix="₹" suffix="/ sq m" value={cost.jantriRatePerSqm} onChange={(v) => onChange({ jantriRatePerSqm: v })} min={0} />
              <NumberInput label="Area for Jantri" suffix="sq m" value={cost.jantriAreaSqm} onChange={(v) => onChange({ jantriAreaSqm: v })} min={0}
                hint={C ? `Blank = carpet (${(C / SQFT_PER_SQM).toFixed(2)} sq m)` : 'Blank = carpet area'} />
            </div>
            <a href="https://garvi.gujarat.gov.in" target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-gold-muted underline hover:text-gold">
              Check Jantri on GARVI ↗
            </a>
          </div>
          <Switch label="Seller is NRI" checked={!!cost.sellerNri} onChange={(v) => onChange({ sellerNri: v })} />
        </div>
      </Card>

      <Card>
        <details>
          <summary className="font-display text-xl">Advanced: statutory rates</summary>
          <div className="mt-4 space-y-3">
            <p className="text-xs text-text-muted">Leave blank to use the standard rate. Change only if rates have been revised.</p>
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="Stamp duty" tip="stampDuty" suffix="%" value={ov.stampDutyPct ?? null} placeholder={String(STAMP_DUTY_PCT)}
                onChange={(v) => setOverride({ stampDutyPct: v ?? undefined })} min={0} />
              <NumberInput label="Registration" tip="registration" suffix="%" value={ov.registrationPct ?? null} placeholder={String(REGISTRATION_PCT)}
                onChange={(v) => setOverride({ registrationPct: v ?? undefined })} min={0} />
              <NumberInput label="Registration cap" prefix="₹" value={ov.registrationCap ?? null} placeholder={REGISTRATION_CAP == null ? 'No cap' : String(REGISTRATION_CAP)}
                onChange={(v) => setOverride({ registrationCap: v })} min={0} />
              <NumberInput label="GST, under construction" tip="gst" suffix="%" value={ov.gstUnderConstructionPct ?? null} placeholder={String(GST.underConstructionPct)}
                onChange={(v) => setOverride({ gstUnderConstructionPct: v ?? undefined })} min={0} />
            </div>
          </div>
        </details>
      </Card>
    </div>
  );
}
