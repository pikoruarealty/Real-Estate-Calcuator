'use client';

import { GST, REGISTRATION_CAP, REGISTRATION_PCT, SQFT_PER_SQM, STAMP_DUTY_PCT } from '@/engine/config';
import { formatINR } from '@/engine/format';
import type { AreaResult, BuyerType, CostInput, CostResult, PropertyType, StatutoryOverrides } from '@/engine/types';
import { Card, Disclosure } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { Segmented, Switch } from '@/components/ui/Toggle';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';
import { AddOnRows } from './AddOnRows';

function Sub({ children, tip }: { children: React.ReactNode; tip?: string }) {
  return <h3 className="mb-3 flex items-center text-[13px] font-semibold uppercase tracking-wider text-text-muted">{children}{tip && <Tooltip term={tip} />}</h3>;
}

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

  let equivalent: string | undefined;
  if (cost.baseRate && S && C) {
    equivalent =
      cost.rateBasis === 'sbu'
        ? `That’s really ${formatINR(cost.baseRate * (S / C))} per sq ft you can use.`
        : `Same as ${formatINR(cost.baseRate * (C / S))} per super built-up sq ft.`;
  }
  const floorsAbove = Math.max(0, (cost.floor || 0) - (cost.frcBaseFloor || 0));

  const setOverride = (patch: Partial<StatutoryOverrides>) => {
    const next: StatutoryOverrides = { ...cost.overrides, ...patch };
    for (const k of Object.keys(next) as (keyof StatutoryOverrides)[]) if (next[k] === undefined) delete next[k];
    onChange({ overrides: next });
  };
  const ov = cost.overrides;
  const moreSet =
    (cost.frcRatePerFloor > 0 ? 1 : 0) + (cost.agreementValueOverride ? 1 : 0) + (cost.jantriValue || cost.jantriRatePerSqm ? 1 : 0) +
    (cost.sellerNri ? 1 : 0) + Object.keys(ov).length;

  return (
    <div className="space-y-4">
      <Card title="What’s the price?" subtitle="The rate per sq ft from the builder’s quote.">
        <div className="space-y-5">
          <NumberInput
            label="Base rate"
            tip="baseRate"
            prefix="₹"
            suffix="per sq ft"
            value={cost.baseRate}
            onChange={(v) => onChange({ baseRate: v })}
            min={0}
            placeholder="6,500"
            hint={equivalent}
          />
          <Segmented
            label="This rate is on"
            tip="rateBasis"
            value={cost.rateBasis}
            onChange={(rateBasis) => onChange({ rateBasis })}
            options={[{ value: 'sbu', label: 'Super built-up' }, { value: 'carpet', label: 'Carpet' }]}
            size="sm"
          />
          <Segmented
            label="The building is"
            tip="status"
            value={cost.status}
            onChange={(status) => onChange({ status })}
            options={[{ value: 'underConstruction', label: 'Under construction' }, { value: 'ready', label: 'Ready to move' }]}
            size="sm"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Buyer" tip="buyerType" value={cost.buyerType} onChange={(v) => onChange({ buyerType: v as BuyerType })}>
              <option value="male">Man / individual</option>
              <option value="soleWoman">Woman, buying alone</option>
              <option value="joint">Joint buyers</option>
              <option value="company">Company</option>
            </Select>
            <Select label="Property" tip="propertyType" value={cost.propertyType} onChange={(v) => onChange({ propertyType: v as PropertyType })}>
              <option value="flat">Flat</option>
              <option value="penthouse">Penthouse</option>
              <option value="commercialOffice">Office</option>
              <option value="shop">Shop</option>
            </Select>
          </div>
          {cost.buyerType === 'soleWoman' && <p className="-mt-2 text-[13px] text-gold">Nice, you save the 1% registration fee.</p>}
          {commercial && (
            <Select label="GST on commercial property" tip="commercialGst" value={cost.commercialGst} onChange={(v) => onChange({ commercialGst: Number(v) as 5 | 12 })}>
              <option value={12}>12%</option>
              <option value={5}>5%</option>
            </Select>
          )}
        </div>
      </Card>

      <Card title="Builder’s extra charges" tip="addOns" subtitle="Tap to add whatever is on your quote. Skip what isn’t.">
        <AddOnRows rows={cost.addOns} area={area} basePrice={result?.basePrice ?? 0} onChange={(addOns) => onChange({ addOns })} />
      </Card>

      <Disclosure
        summary={<>More options {moreSet > 0 && <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold">{moreSet} set</span>}</>}
        hint="Floor rise, agreement value, Jantri, tax rates. Most people can skip this."
      >
        <div className="space-y-7">
          <section>
            <Sub tip="frc">Floor rise</Sub>
            <div className="grid grid-cols-3 items-end gap-2">
              <NumberInput label="Your floor" tip="floor" emptyAsZero min={0} value={cost.floor || null} onChange={(v) => onChange({ floor: v ?? 0 })} placeholder="0" />
              <NumberInput label="Starts after" tip="frcBaseFloor" emptyAsZero min={0} value={cost.frcBaseFloor || null} onChange={(v) => onChange({ frcBaseFloor: v ?? 0 })} placeholder="0" />
              <NumberInput label="₹ per floor" tip="frcRate" prefix="₹" emptyAsZero min={0} value={cost.frcRatePerFloor || null} onChange={(v) => onChange({ frcRatePerFloor: v ?? 0 })} placeholder="0" />
            </div>
            {cost.frcRatePerFloor > 0 && (
              <p className="mt-2 text-[13px] text-text-muted">
                {floorsAbove} floor{floorsAbove === 1 ? '' : 's'} × {formatINR(cost.frcRatePerFloor)} = {formatINR(cost.frcRatePerFloor * floorsAbove)} extra per sq ft
              </p>
            )}
          </section>

          <section>
            <Sub tip="avOverride">Agreement value</Sub>
            <NumberInput
              label="Value written in your agreement"
              prefix="₹"
              words
              value={cost.agreementValueOverride}
              onChange={(v) => onChange({ agreementValueOverride: v })}
              min={0}
              placeholder={result ? new Intl.NumberFormat('en-IN').format(result.computedAgreementValue) : undefined}
              hint="Only if you have the agreement. Taxes are then based on it."
            />
          </section>

          <section className="space-y-3">
            <Sub tip="jantri">Jantri (government value)</Sub>
            <NumberInput label="Jantri value" tip="jantriValue" prefix="₹" words value={cost.jantriValue} onChange={(v) => onChange({ jantriValue: v })} min={0} />
            <div className="grid grid-cols-2 gap-2">
              <NumberInput label="or rate" tip="jantriRate" prefix="₹" suffix="/ sq m" value={cost.jantriRatePerSqm} onChange={(v) => onChange({ jantriRatePerSqm: v })} min={0} />
              <NumberInput label="Area" tip="jantriArea" suffix="sq m" value={cost.jantriAreaSqm} onChange={(v) => onChange({ jantriAreaSqm: v })} min={0}
                placeholder={C ? (C / SQFT_PER_SQM).toFixed(2) : undefined} />
            </div>
          </section>

          <section className="space-y-4">
            <Sub>Other</Sub>
            <Switch label="Seller is an NRI" tip="sellerNri" checked={!!cost.sellerNri} onChange={(v) => onChange({ sellerNri: v })} />
            <div>
              <div className="mb-2 flex min-h-5 items-center text-[13px] text-text-muted">
                <label htmlFor="projectName">Project name, for your PDF</label>
                <Tooltip term="projectName" />
              </div>
              <input
                id="projectName"
                value={cost.projectName}
                maxLength={120}
                onChange={(e) => onChange({ projectName: e.target.value })}
                className="h-12 w-full rounded-2xl bg-surface-2 px-4 text-base ring-1 ring-transparent placeholder:text-text-muted/40 hover:ring-white/10 focus:outline-none focus-visible:ring-gold/70 sm:text-[15px]"
                placeholder="e.g. Skyline Heights"
              />
            </div>
          </section>

          <section>
            <Sub tip="advanced">Tax rates</Sub>
            <p className="mb-3 text-[13px] text-text-muted">Leave blank to use the current rates.</p>
            <div className="grid grid-cols-2 gap-2">
              <NumberInput label="Stamp duty" tip="stampDuty" suffix="%" value={ov.stampDutyPct ?? null} placeholder={String(STAMP_DUTY_PCT)}
                onChange={(v) => setOverride({ stampDutyPct: v ?? undefined })} min={0} />
              <NumberInput label="Registration" tip="registration" suffix="%" value={ov.registrationPct ?? null} placeholder={String(REGISTRATION_PCT)}
                onChange={(v) => setOverride({ registrationPct: v ?? undefined })} min={0} />
              <NumberInput label="Registration cap" tip="registration" prefix="₹" value={ov.registrationCap ?? null} placeholder={REGISTRATION_CAP == null ? 'None' : String(REGISTRATION_CAP)}
                onChange={(v) => setOverride({ registrationCap: v })} min={0} />
              <NumberInput label="GST (under constr.)" tip="gst" suffix="%" value={ov.gstUnderConstructionPct ?? null} placeholder={String(GST.underConstructionPct)}
                onChange={(v) => setOverride({ gstUnderConstructionPct: v ?? undefined })} min={0} />
            </div>
          </section>
        </div>
      </Disclosure>
    </div>
  );
}
