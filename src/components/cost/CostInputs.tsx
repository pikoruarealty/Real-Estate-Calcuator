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
        ? `Same as ${formatINR(cost.baseRate * (S / C))} per carpet sq ft (the space you actually use)`
        : `Same as ${formatINR(cost.baseRate * (C / S))} per super built-up sq ft`;
  }

  const floorsAbove = Math.max(0, (cost.floor || 0) - (cost.frcBaseFloor || 0));

  const setOverride = (patch: Partial<StatutoryOverrides>) => {
    const next: StatutoryOverrides = { ...cost.overrides, ...patch };
    for (const k of Object.keys(next) as (keyof StatutoryOverrides)[]) if (next[k] === undefined) delete next[k];
    onChange({ overrides: next });
  };
  const ov = cost.overrides;
  const addedCharges = cost.addOns.filter((r) => r.amount > 0).length;

  return (
    <div className="space-y-4">
      <Card title="About the property" subtitle="This decides which taxes apply.">
        <div className="space-y-4">
          <Select label="Property type" tip="propertyType" value={cost.propertyType} onChange={(v) => onChange({ propertyType: v as PropertyType })}>
            <option value="flat">Flat / apartment</option>
            <option value="penthouse">Penthouse</option>
            <option value="commercialOffice">Commercial office</option>
            <option value="shop">Shop</option>
          </Select>
          {commercial && (
            <Select label="GST on commercial property" tip="commercialGst" value={cost.commercialGst} onChange={(v) => onChange({ commercialGst: Number(v) as 5 | 12 })}>
              <option value={12}>12%</option>
              <option value={5}>5%</option>
            </Select>
          )}
          <Segmented
            label="Is the building ready?"
            value={cost.status}
            onChange={(status) => onChange({ status })}
            options={[{ value: 'underConstruction', label: 'Under construction' }, { value: 'ready', label: 'Ready (BU received)' }]}
            tip="status"
            size="sm"
            hint={cost.status === 'ready' ? 'No GST on the flat price once the building has its BU (completion) permission.' : 'GST is added to the price of an under-construction home.'}
          />
          <Select label="Who will own the home?" tip="buyerType" value={cost.buyerType} onChange={(v) => onChange({ buyerType: v as BuyerType })}
            hint={cost.buyerType === 'soleWoman' ? 'You save the 1% registration fee.' : 'Tip: a woman buying alone pays no registration fee in Gujarat.'}>
            <option value="male">Man / other individual</option>
            <option value="soleWoman">A woman, buying alone</option>
            <option value="joint">Joint buyers</option>
            <option value="company">Company / firm</option>
          </Select>
          <div>
            <div className="mb-1.5 flex min-h-6 items-center text-[13px] font-medium text-text-muted">
              <label htmlFor="projectName">Project name (optional)</label>
              <Tooltip term="projectName" />
            </div>
            <input
              id="projectName"
              value={cost.projectName}
              maxLength={120}
              onChange={(e) => onChange({ projectName: e.target.value })}
              className="min-h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm placeholder:text-text-muted/50 hover:border-gold-muted focus:border-gold"
              placeholder="e.g. Skyline Heights, Bopal"
            />
          </div>
        </div>
      </Card>

      <Card title="The price you were quoted" subtitle="From the builder’s quote or brochure.">
        <div className="space-y-4">
          <div className="space-y-3">
            <NumberInput
              label="Base rate (price per sq ft)"
              tip="baseRate"
              prefix="₹"
              suffix="/ sq ft"
              value={cost.baseRate}
              onChange={(v) => onChange({ baseRate: v })}
              min={0}
              placeholder="e.g. 6,500"
              hint={equivalent ?? undefined}
            />
            <Segmented
              label="This rate is per sq ft of…"
              tip="rateBasis"
              value={cost.rateBasis}
              onChange={(rateBasis) => onChange({ rateBasis })}
              options={[{ value: 'sbu', label: 'Super built-up' }, { value: 'carpet', label: 'Carpet' }]}
              size="sm"
              hint="Most Ahmedabad builders quote on super built-up. If unsure, ask the builder."
            />
          </div>

          <fieldset className="rounded-lg border border-border p-3">
            <legend className="flex items-center px-1 text-[13px] font-medium text-text-muted">
              Floor rise charge (optional)<Tooltip term="frc" />
            </legend>
            <div className="grid grid-cols-3 items-end gap-2">
              <NumberInput label="Your floor" tip="floor" emptyAsZero min={0} value={cost.floor || null} onChange={(v) => onChange({ floor: v ?? 0 })} placeholder="0" />
              <NumberInput label="Starts after" tip="frcBaseFloor" emptyAsZero min={0} value={cost.frcBaseFloor || null} onChange={(v) => onChange({ frcBaseFloor: v ?? 0 })} placeholder="0" />
              <NumberInput label="₹ per floor" tip="frcRate" prefix="₹" emptyAsZero min={0} value={cost.frcRatePerFloor || null} onChange={(v) => onChange({ frcRatePerFloor: v ?? 0 })} placeholder="0" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-text-muted">
              {cost.frcRatePerFloor > 0
                ? `You pay floor rise for ${floorsAbove} floor${floorsAbove === 1 ? '' : 's'} = ${formatINR(cost.frcRatePerFloor * floorsAbove)} extra per sq ft.`
                : 'Skip this if your builder doesn’t charge more for higher floors.'}
            </p>
          </fieldset>
        </div>
      </Card>

      <Card
        title="Builder’s extra charges"
        tip="addOns"
        subtitle={`Copy these from the builder’s cost sheet. Tap a charge to fill it in. ${addedCharges ? `${addedCharges} added.` : 'None added yet.'}`}
      >
        <AddOnRows rows={cost.addOns} area={area} basePrice={result?.basePrice ?? 0} onChange={(addOns) => onChange({ addOns })} />
      </Card>

      <Card title="Agreement & government value" subtitle="Optional. Fill these in if you have the documents; otherwise we estimate.">
        <div className="space-y-4">
          <NumberInput
            label="Agreement value (optional)"
            tip="avOverride"
            prefix="₹"
            words
            value={cost.agreementValueOverride}
            onChange={(v) => onChange({ agreementValueOverride: v })}
            min={0}
            placeholder={result ? new Intl.NumberFormat('en-IN').format(result.computedAgreementValue) : undefined}
            hint="If your agreement states a value, enter it — taxes are calculated on it."
          />
          <fieldset className="space-y-3 rounded-lg border border-border p-3">
            <legend className="flex items-center px-1 text-[13px] font-medium text-text-muted">
              Jantri (government value), optional<Tooltip term="jantri" />
            </legend>
            <p className="text-xs leading-relaxed text-text-muted">Stamp duty is charged on whichever is higher: your agreement value or the Jantri value. Enter the value, or the rate.</p>
            <NumberInput label="Jantri value" tip="jantriValue" prefix="₹" words value={cost.jantriValue} onChange={(v) => onChange({ jantriValue: v })} min={0} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NumberInput label="…or Jantri rate" tip="jantriRate" prefix="₹" suffix="/ sq m" value={cost.jantriRatePerSqm} onChange={(v) => onChange({ jantriRatePerSqm: v })} min={0} />
              <NumberInput label="Area for Jantri" tip="jantriArea" suffix="sq m" value={cost.jantriAreaSqm} onChange={(v) => onChange({ jantriAreaSqm: v })} min={0}
                hint={C ? `Blank = carpet (${(C / SQFT_PER_SQM).toFixed(2)} sq m)` : 'Blank = carpet area'} />
            </div>
            <a href="https://garvi.gujarat.gov.in" target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-gold-muted underline hover:text-gold">
              Check Jantri on GARVI ↗
            </a>
          </fieldset>
          <Switch label="Seller is NRI (resale only)" tip="sellerNri" checked={!!cost.sellerNri} onChange={(v) => onChange({ sellerNri: v })} />
        </div>
      </Card>

      <Card>
        <details>
          <summary className="flex min-h-8 items-center font-display text-lg">
            <span aria-hidden className="chev mr-2 text-xs text-text-muted">▶</span>Advanced: tax rates <span className="ml-2 text-sm font-normal tracking-normal text-text-muted">— most people can skip this</span>
            <Tooltip term="advanced" />
          </summary>
          <div className="mt-4 space-y-3">
            <p className="text-xs text-text-muted">Leave blank to use today’s standard Gujarat rates (shown in grey). Change only if a rate has been revised.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NumberInput label="Stamp duty" tip="stampDuty" suffix="%" value={ov.stampDutyPct ?? null} placeholder={String(STAMP_DUTY_PCT)}
                onChange={(v) => setOverride({ stampDutyPct: v ?? undefined })} min={0} />
              <NumberInput label="Registration fee" tip="registration" suffix="%" value={ov.registrationPct ?? null} placeholder={String(REGISTRATION_PCT)}
                onChange={(v) => setOverride({ registrationPct: v ?? undefined })} min={0} />
              <NumberInput label="Registration fee cap" tip="registration" prefix="₹" value={ov.registrationCap ?? null} placeholder={REGISTRATION_CAP == null ? 'No cap' : String(REGISTRATION_CAP)}
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
